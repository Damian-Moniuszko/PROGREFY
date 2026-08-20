import type { FastifyInstance } from 'fastify'
import { UserRole } from '../generated/prisma/client'
import {
  loginUser,
  registerUser,
  verifyEmail,
} from '../services/auth.service'
import { sendVerificationEmail } from '../services/email.service'
import { getGoogleAuthUrl, getGoogleUser } from '../services/google.service'

interface RegisterBody {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'CLIENT' | 'TRAINER'
}

const strongPassword = (password: string) =>
  password.length >= 8 && password.length <= 128 &&
  /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(password) &&
  /[a-ząćęłńóśźż]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9]/.test(password)

const validEmail = (email: string) =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const validName = (value: string) =>
  value.length >= 2 && value.length <= 50 &&
  /^\p{L}+(?:[ '-]\p{L}+)*$/u.test(value)

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterBody }>(
    '/api/auth/register',
    async (request, reply) => {
      const email = request.body.email?.trim().toLowerCase()
      const password = request.body.password ?? ''
      const firstName = request.body.firstName?.trim()
      const lastName = request.body.lastName?.trim()
      const role = request.body.role

      if (!email || !password || !firstName || !lastName || !role) {
        return reply.status(400).send({ message: 'Wszystkie pola są wymagane.' })
      }

      if (!validEmail(email)) {
        return reply.status(400).send({ message: 'Podaj poprawny adres e-mail.' })
      }

      if (!validName(firstName) || !validName(lastName)) {
        return reply.status(400).send({ message: 'Podaj poprawne imię i nazwisko.' })
      }

      if (!['CLIENT', 'TRAINER'].includes(role)) {
        return reply.status(400).send({ message: 'Nieprawidłowa rola.' })
      }

      if (!strongPassword(password)) {
        return reply.status(400).send({
          message: 'Hasło musi mieć 8–128 znaków, wielką i małą literę, cyfrę oraz znak specjalny.',
        })
      }

      try {
        const result = await registerUser(app.prisma, {
          email,
          password,
          firstName,
          lastName,
          role: role === 'CLIENT' ? UserRole.CLIENT : UserRole.TRAINER,
        })

        await sendVerificationEmail(
          result.user.email,
          result.user.firstName,
          result.verificationToken,
        )

        const token = await app.jwt.sign({
          userId: result.user.id,
          role: result.user.role,
        })

        return reply.status(201).send({
          message: 'Konto utworzone. Sprawdź e-mail i potwierdź adres.',
          token,
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
          },
        })
      } catch (error) {
        if (error instanceof Error && error.message === 'USER_ALREADY_EXISTS') {
          return reply.status(409).send({ message: 'User with this email already exists' })
        }

        request.log.error(error)
        return reply.status(500).send({ message: 'Internal server error' })
      }
    },
  )

  app.post<{ Body: { email: string; password: string } }>(
    '/api/auth/login',
    async (request, reply) => {
      const email = request.body.email?.trim().toLowerCase()
      const password = request.body.password ?? ''

      try {
        const user = await loginUser(app.prisma, email, password)
        const token = await app.jwt.sign({ userId: user.id, role: user.role })

        return reply.send({
          message: 'Login successful',
          token,
          user,
        })
      } catch {
        return reply.status(401).send({
          message: 'Nieprawidłowy e-mail lub hasło.',
        })
      }
    },
  )

    app.post(
    '/api/auth/verify-email',
    async (request, reply) => {
      const { token } = request.query as { token?: string }

      if (!token) {
        return reply.status(400).send({
          message: 'Brak tokenu weryfikacyjnego.',
        })
      }

      try {
        const user = await verifyEmail(
          app.prisma,
          token,
        )

        const jwtToken = await app.jwt.sign({
          userId: user.id,
          role: user.role,
        })

        return reply.send({
          message: 'E-mail został potwierdzony.',
          token: jwtToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        })
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'INVALID_VERIFICATION_TOKEN') {
            return reply.status(400).send({
              message: 'Nieprawidłowy token weryfikacyjny.',
            })
          }

          if (error.message === 'VERIFICATION_TOKEN_EXPIRED') {
            return reply.status(400).send({
              message: 'Token weryfikacyjny wygasł.',
            })
          }
        }

        request.log.error(error)

        return reply.status(500).send({
          message: 'Nie udało się potwierdzić adresu e-mail.',
        })
      }
    },
  )

  
  app.get('/api/auth/google', async (_request, reply) => {
    const url = getGoogleAuthUrl()

    return reply.redirect(url)
  })

  app.get('/api/auth/google/callback', async (request, reply) => {
    const { code } = request.query as { code?: string }

    if (!code) {
      return reply.status(400).send({
        message: 'Brak kodu Google OAuth.',
      })
    }

    try {
      const googleUser = await getGoogleUser(code)

      let user = await app.prisma.user.findUnique({
        where: {
          email: googleUser.email,
        },
      })

      if (!user) {
        user = await app.prisma.user.create({
          data: {
            email: googleUser.email,
            passwordHash: null,
            hasPassword: false,
            emailVerified: true,
            firstName: googleUser.firstName || 'User',
            lastName: googleUser.lastName || '',
            avatarUrl: googleUser.avatarUrl,
            role: UserRole.CLIENT,
          },
        })
      }

      const account = await app.prisma.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: googleUser.googleId,
          },
        },
      })

      if (!account) {
        await app.prisma.oAuthAccount.create({
          data: {
            provider: 'google',
            providerAccountId: googleUser.googleId,
            userId: user.id,
          },
        })
      }

      const token = await app.jwt.sign({
        userId: user.id,
        role: user.role,
      })

      return reply.redirect(
        `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/auth/google/callback?token=${token}`,
      )
    } catch (error) {
      request.log.error(error)

      return reply.status(500).send({
        message: 'Nie udało się zalogować przez Google.',
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

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
          phone: user.phone,
          gender: user.gender,
          birthDate: user.birthDate,
          hasPassword: user.hasPassword,
          clientProfile: user.clientProfile,
          trainerProfile: user.trainerProfile,
        },
      })
    } catch (error) {
      request.log.error(error)

      return reply.status(401).send({
        message: 'Unauthorized',
      })
    }
  })
}
