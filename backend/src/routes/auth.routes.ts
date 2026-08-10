import type { FastifyInstance } from 'fastify'
import { UserRole } from '../generated/prisma/client'
import {
  loginUser,
  registerUser,
} from '../services/auth.service'

interface RegisterBody {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'CLIENT' | 'TRAINER'
}

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterBody }>(
    '/api/auth/register',
    
    async (request, reply) => {
      const { email, password, firstName, lastName, role } = request.body

      if (!email || !password || !firstName || !lastName || !role) {
        return reply.status(400).send({
          message: 'All fields are required',
        })
      }

      if (!['CLIENT', 'TRAINER'].includes(role)) {
        return reply.status(400).send({
          message: 'Invalid role',
        })
      }

      if (password.length < 8) {
        return reply.status(400).send({
          message: 'Password must be at least 8 characters long',
        })
      }

      try {
        const user = await registerUser(app.prisma, {
          email,
          password,
          firstName,
          lastName,
          role: role === 'CLIENT' ? UserRole.CLIENT : UserRole.TRAINER,
        })

        return reply.status(201).send({
          message: 'User registered successfully',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        })
      } catch (error) {
        if (error instanceof Error && error.message === 'USER_ALREADY_EXISTS') {
          return reply.status(409).send({
            message: 'User with this email already exists',
          })
        }

        request.log.error(error)

        return reply.status(500).send({
          message: 'Internal server error',
        })
      }
    },
  )

  app.post<{
    Body: {
      email: string
      password: string
    }
  }>('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body

    if (!email || !password) {
      return reply.status(400).send({
        message: 'Email and password are required',
      })
    }

    try {
      const user = await loginUser(
        app.prisma,
        email,
        password,
      )

      const token = await app.jwt.sign({
        userId: user.id,
        role: user.role,
      })

      return reply.status(200).send({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'INVALID_CREDENTIALS'
      ) {
        return reply.status(401).send({
          message: 'Invalid email or password',
        })
      }

      request.log.error(error)

      return reply.status(500).send({
        message: 'Internal server error',
      })
    }
  })

  app.get('/api/me', async (request, reply) => {
  try {
    const decoded = await request.jwtVerify<{
      userId: number
      role: 'CLIENT' | 'TRAINER'
    }>()

    const user = await app.prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      include: {
        clientProfile: true,
        trainerProfile: true,
      },
    })

    if (!user) {
      return reply.status(404).send({
        message: 'User not found',
      })
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        clientProfile: user.clientProfile,
        trainerProfile: user.trainerProfile,
      },
    }
  } catch {
    return reply.status(401).send({
      message: 'Unauthorized',
    })
  }
})
}