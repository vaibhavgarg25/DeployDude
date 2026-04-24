import express from 'express'
import http from 'http'
import { generateSlug } from 'random-word-slugs'
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs'
import Redis from 'ioredis'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

const PORT = Number(process.env.PORT || 8080)
const SOCKET_SERVER_PORT = Number(process.env.SOCKET_SERVER_PORT || 9000)

const PUBLIC_PROTOCOL = process.env.PUBLIC_PROTOCOL || 'http'
const PUBLIC_BASE_DOMAIN = process.env.PUBLIC_BASE_DOMAIN || 'localhost'
const PUBLIC_PORT = process.env.PUBLIC_PORT || '8000'

const subscriber = new Redis(process.env.REDIS_URL)

const socketServer = http.createServer()

const io = new Server(socketServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  socket.on('subscribe', (channel) => {
    console.log(`Socket ${socket.id} subscribed to ${channel}`)
    socket.join(channel)
    socket.emit('message', `joined ${channel}`)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
  })
})

socketServer.listen(SOCKET_SERVER_PORT, () => {
  console.log(`Socket server running at ${SOCKET_SERVER_PORT} port`)
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
  TASK: process.env.TASK,
}

function buildProjectUrl(projectSlug) {
  const host = `${projectSlug}.${PUBLIC_BASE_DOMAIN}`

  const isDefaultPort =
    (PUBLIC_PROTOCOL === 'http' && PUBLIC_PORT === '80') ||
    (PUBLIC_PROTOCOL === 'https' && PUBLIC_PORT === '443')

  return `${PUBLIC_PROTOCOL}://${host}${isDefaultPort ? '' : `:${PUBLIC_PORT}`}`
}

app.use(express.json())
app.set('trust proxy', true)

app.post('/project', async (req, res) => {
  try {
    const { gitURL, slug } = req.body

    if (!gitURL) {
      return res.status(400).json({
        status: 'error',
        message: 'gitURL is required',
      })
    }

    const projectSlug = slug || generateSlug()

    const command = new RunTaskCommand({
      cluster: config.CLUSTER,
      taskDefinition: config.TASK,
      launchType: 'FARGATE',
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: 'ENABLED',
          subnets: [
            'subnet-03e103fd64efba6be',
            'subnet-02b96840d4c826f61',
            'subnet-0fb7b1b472485bc0d',
          ],
          securityGroups: ['sg-030eb2f6baf61e532'],
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: 'deploydude-image',
            environment: [
              { name: 'GIT_REPOSITORY_URL', value: gitURL },
              { name: 'PROJECT_ID', value: projectSlug },
              { name: 'REDIS_URL', value: process.env.REDIS_URL },
              { name: 'AWS_REGION', value: process.env.AWS_REGION },
              { name: 'AWS_ACCESS_KEY_ID', value: process.env.AWS_ACCESS_KEY_ID },
              { name: 'AWS_SECRET_ACCESS_KEY', value: process.env.AWS_SECRET_ACCESS_KEY },
              { name: 'S3_BUCKET_NAME', value: process.env.S3_BUCKET_NAME },
            ],
          },
        ],
      },
    })

    await ecsClient.send(command)

    return res.json({
      status: 'queued',
      data: {
        projectSlug,
        url: buildProjectUrl(projectSlug),
      },
    })
  } catch (error) {
    console.error('Error while running ECS task:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to start deployment task',
    })
  }
})

async function initRedisSubscriber() {
  try {
    console.log('Subscribed to logs...')

    await subscriber.psubscribe('logs:*')

    subscriber.on('pmessage', (pattern, channel, message) => {
      console.log(`Redis message from ${channel}:`, message)
      io.to(channel).emit('message', message)
    })
  } catch (error) {
    console.error('Redis subscriber error:', error)
  }
}

initRedisSubscriber()

app.listen(PORT, () => {
  console.log(`API server running at ${PORT} port`)
})