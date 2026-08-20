import 'dotenv/config'

import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'

import prismaPlugin from './plugins/prisma'
import { trainerRoutes } from './routes/trainer.routes'
import { authRoutes } from './routes/auth.routes'
import { profileRoutes } from './routes/profile.routes'
import { appointmentRoutes } from './routes/appointment.routes'
import { accountRoutes } from './routes/account.routes'
import { trainingRoutes } from './routes/training.routes'

const app = Fastify({
  logger: true,
})

async function startServer() {
  try {
    await app.register(cors, {
      origin: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    })

    await app.register(fastifyJwt, {
      secret: process.env.JWT_SECRET!,
    })

    await app.register(prismaPlugin)

    await app.register(authRoutes)

    await app.register(profileRoutes)

    await app.register(appointmentRoutes)

    await app.register(accountRoutes)

    await app.register(trainerRoutes)

    await app.register(trainingRoutes)

    app.get('/api/health', async () => {
      return {
        status: 'ok',
        message: 'PROGREFY backend is running',
      }
    })

    await app.listen({
      port: 3000,
      host: '0.0.0.0',
    })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

startServer()
