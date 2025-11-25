import { exec } from 'child_process';
import fs from 'fs'
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';
import Redis from 'ioredis';
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';

dotenv.config()

const publisher=new Redis(process.env.REDIS_URL)
const PROJECT_ID=process.env.PROJECT_ID;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function publishLog(log){
    publisher.publish(`logs:${PROJECT_ID}`,JSON.stringify({log}))
}

const s3Client = new S3Client({ 
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});


async function init(){
console.log("Executing build server script...");
publishLog("Build Started....")
const outputDir = path.join(__dirname,'output');
const p=exec(`cd ${outputDir} && npm install && npm run build`);

p.stdout.on('data',function(data){
    console.log(data.toString()); 
    publishLog(data.toString());
})

p.stdout.on('data',function(data){
    console.log(data.toString());
    publishLog(`Error:${data.toString()}`);
})

p.on('close',async function(){
    console.log(`Build process completed`);
    publishLog(`Build process completed`);
    const distFolderPath=path.join(__dirname,'output','dist');
    const distFolderContent=fs.readdirSync(distFolderPath,{recursive:true});
    for (const file of distFolderContent){
        const filePath=path.join(distFolderPath,file)
        if(fs.lstatSync(filePath).isDirectory()) continue;
        console.log(`Uploading file: ${filePath} to S3...`)
        publishLog(`Uploading file: ${filePath} to S3...`)
        const command=new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key:`__outputs/${PROJECT_ID}/${file}`,
            Body:fs.createReadStream(filePath),
            ContentType:mime.lookup(filePath),
        })     

        await s3Client.send(command)
        console.log(`Uploaded file: ${filePath} to S3 successfully.`)
        publishLog(`Uploaded file: ${filePath} to S3 successfully.`)
    }
    console.log(`All files uploaded to S3 successfully.`);
    publishLog(`All files uploaded to S3 successfully.`)
    publishLog(`Done`)
})
}

init();