import express from 'express'
import { generateSlug } from 'random-word-slugs'
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs'
import Redis from 'ioredis';
import { Server } from 'socket.io';
import dotenv from 'dotenv'

const app = express()
dotenv.config()
const PORT = process.env.PORT
const SOCKET_SERVER_PORT=process.env.SOCKET_SERVER_PORT

const subscriber=new Redis(process.env.REDIS_URL)
const io=new Server({cors:'*'})

io.on('connection',socket=>{
    socket.on('subscribe',channel=>{
        socket.join(channel)
        socket.emit('message',`joined ${channel}`)
    })
})

io.listen(SOCKET_SERVER_PORT,()=>{
    console.log(`Socket server running at the port ${SOCKET_SERVER_PORT}`)
})

const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})

const config = {
    CLUSTER: process.env.CLUSTER,
    TASK: process.env.TASK
}
app.use(express.json())

app.post('/project', async (req, res) => {
    const { gitURL, slug } = req.body
    const projectSlug = slug ? slug : generateSlug()

    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: ['subnet-03e103fd64efba6be','subnet-02b96840d4c826f61','subnet-0fb7b1b472485bc0d'],
                securityGroups: ['sg-030eb2f6baf61e532'],
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builder-image',
                    environment: [
                        {name:'GIT_REPOSITORY_URL',value: gitURL },
                        {name:'PROJECT_ID',value: projectSlug },
                    ]
                }
            ]
        }

    })

    await ecsClient.send(command)
    return res.json({ status: "queued", data: { projectSlug, url: `http://${projectSlug}.localhost:8000` } })
})

async function initRedisSubscriber(){
    console.log("subscribed to logs......")
    subscriber.psubscribe('logs:*')
    subscriber.on('pmessage',(pattern,channel,message)=>{
        io.to(channel).emit('message',message)
    })
}

initRedisSubscriber()
app.listen(PORT, () => {
    console.log(`Server running at ${PORT} port`)
})