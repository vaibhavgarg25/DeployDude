import express from 'express'
import { generateSlug } from 'random-word-slugs'
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs'
import Redis from 'ioredis';
import { Server } from 'socket.io';
import dotenv from 'dotenv'

const app = express()
dotenv.config()
const PORT = process.env.PORT
const SOCKET_SERVER_PORT = process.env.SOCKET_SERVER_PORT

const subscriber = new Redis(process.env.REDIS_URL)
const io = new Server(Number(SOCKET_SERVER_PORT), {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', socket => {
  console.log(`[SOCKET] Client connected: ${socket.id}`)
  socket.on('subscribe', channel => {
    console.log(`[SOCKET] Client ${socket.id} subscribed to ${channel}`)
    socket.join(channel)
    socket.emit('message', `joined ${channel}`)
  })
  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`)
  })
})

console.log(`[API] Socket server running at port ${SOCKET_SERVER_PORT}`)


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
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
})
app.use(express.json())

app.post('/project', async (req, res) => {
  const { gitURL, slug } = req.body
  console.log(`[API] POST /project received - gitURL: ${gitURL}, slug: ${slug}`)
  if (!gitURL) {
    console.log(`[API] Error: gitURL is required`)
    return res.status(400).json({ message: 'gitURL is required' })
  }

  const projectSlug = slug ? slug : generateSlug()

  try {
    const command = new RunTaskCommand({
      cluster: config.CLUSTER,
      taskDefinition: config.TASK,
      launchType: 'FARGATE',
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: 'ENABLED',
          subnets: ['subnet-03e103fd64efba6be', 'subnet-02b96840d4c826f61', 'subnet-0fb7b1b472485bc0d'],
          securityGroups: ['sg-030eb2f6baf61e532'],
        }
      },
      overrides: {
        containerOverrides: [
          {
            name: "deployops-container",
            environment: [

              { name: "GIT_REPOSITORY_URL", value: gitURL },
              { name: "PROJECT_ID", value: projectSlug },
              { name: "REDIS_URL", value: process.env.REDIS_URL },
              { name: "AWS_REGION", value: "ap-south-1" },
              { name: "AWS_ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID },
              { name: "AWS_SECRET_ACCESS_KEY", value: process.env.AWS_SECRET_ACCESS_KEY },
              { name: "S3_BUCKET_NAME", value: process.env.S3_BUCKET_NAME }
            ]
          }
        ]
      }

    })

    await ecsClient.send(command)

    const url = `http://${projectSlug}.localhost:8000`

    console.log(`[API] ECS task queued successfully for project: ${projectSlug}`)

    return res.json({
      status: 'queued',
      slug: projectSlug,
      url,
      data: {
        slug: projectSlug,
        projectSlug,
        url,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to queue deployment'
    console.log(`[API] Error queuing ECS task:`, error)
    return res.status(500).json({ message })
  }
})

async function initRedisSubscriber() {
  console.log(`[REDIS] Subscribing to logs:* pattern`)
  subscriber.psubscribe('logs:*')
  subscriber.on('pmessage', (pattern, channel, message) => {
    console.log(`[REDIS] Message received on ${channel}: ${message.substring(0, 50)}...`)
    io.to(channel).emit('message', message)
    console.log(`[SOCKET] Emitted message to ${channel}`)
  })
}

initRedisSubscriber()
app.listen(PORT, () => {
  console.log(`[API] Server running at http://localhost:${PORT}`)
})