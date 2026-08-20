import argon2 from 'argon2'
import type { FastifyInstance } from 'fastify'

type Token = { userId: number }

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value)
}

function isValidPhone(value: string) {
  if (!value) return true
  return /^\+?[0-9\s()-]{9,20}$/.test(value)
}

function isStrongPassword(value: string) {
  return (
    value.length >= 8 &&
    /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(value) &&
    /[a-ząćęłńóśźż]/.test(value) &&
    /\d/.test(value)
  )
}

function isValidDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()
  const minimum = new Date(
    now.getFullYear() - 120,
    now.getMonth(),
    now.getDate(),
  )

  return date <= now && date >= minimum
}

export async function accountRoutes(app: FastifyInstance) {
  app.get('/api/me/account', async (request, reply) => {
    try {
      const token = await request.jwtVerify<Token>()

      const user = await app.prisma.user.findUnique({
        where: { id: token.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          gender: true,
          birthDate: true,
        },
      })

      return { user }
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
  })

  app.patch<{
    Body: {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string | null
      avatarUrl?: string | null
      gender?: string | null
      birthDate?: string | null
    }
  }>('/api/me/account', async (request, reply) => {
    try {
      const token = await request.jwtVerify<Token>()

      const {
        firstName,
        lastName,
        email,
        phone,
        avatarUrl,
        gender,
        birthDate,
      } = request.body

      if (firstName !== undefined) {
        const value = firstName.trim()

        if (
          value.length < 2 ||
          value.length > 40 ||
          !/^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż -]+$/.test(value)
        ) {
          return reply.status(400).send({
            message: 'Podaj poprawne imię.',
          })
        }
      }

      if (lastName !== undefined) {
        const value = lastName.trim()

        if (
          value.length < 2 ||
          value.length > 60 ||
          !/^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż -]+$/.test(value)
        ) {
          return reply.status(400).send({
            message: 'Podaj poprawne nazwisko.',
          })
        }
      }

      if (email !== undefined) {
        const value = email.trim().toLowerCase()

        if (!isValidEmail(value)) {
          return reply.status(400).send({
            message: 'Podaj poprawny adres e-mail.',
          })
        }
      }

      if (phone !== undefined && phone !== null) {
        const value = phone.trim()

        if (!isValidPhone(value)) {
          return reply.status(400).send({
            message: 'Podaj poprawny numer telefonu.',
          })
        }
      }

      if (
        gender !== undefined &&
        gender !== null &&
        !['MALE', 'FEMALE', 'OTHER'].includes(gender)
      ) {
        return reply.status(400).send({
          message: 'Nieprawidłowa wartość płci.',
        })
      }

      if (birthDate !== undefined && birthDate !== null) {
        if (!isValidDate(birthDate)) {
          return reply.status(400).send({
            message: 'Podaj poprawną datę urodzenia.',
          })
        }
      }

      if (avatarUrl !== undefined && avatarUrl !== null) {
        if (avatarUrl.length > 3_000_000) {
          return reply.status(400).send({
            message: 'Zdjęcie profilowe jest za duże.',
          })
        }

        if (!avatarUrl.startsWith('data:image/')) {
          return reply.status(400).send({
            message: 'Nieprawidłowe zdjęcie profilowe.',
          })
        }
      }

      const user = await app.prisma.user.update({
        where: { id: token.userId },
        data: {
          ...(firstName !== undefined && {
            firstName: firstName.trim(),
          }),
          ...(lastName !== undefined && {
            lastName: lastName.trim(),
          }),
          ...(email !== undefined && {
            email: email.trim().toLowerCase(),
          }),
          ...(phone !== undefined && {
            phone: phone?.trim() || null,
          }),
          ...(avatarUrl !== undefined && {
            avatarUrl,
          }),
          ...(gender !== undefined && {
            gender,
          }),
          ...(birthDate !== undefined && {
            birthDate: birthDate ? new Date(birthDate) : null,
          }),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          gender: true,
          birthDate: true,
        },
      })

      return { user }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Unique')
      ) {
        return reply.status(409).send({
          message: 'Ten e-mail jest już używany.',
        })
      }

      request.log.error(error)

      return reply.status(500).send({
        message: 'Nie udało się zapisać zmian.',
      })
    }
  })

  app.patch<{
    Body: {
      currentPassword: string
      newPassword: string
    }
  }>('/api/me/password', async (request, reply) => {
    try {
      const token = await request.jwtVerify<Token>()
      const { currentPassword, newPassword } = request.body

      if (!currentPassword) {
        return reply.status(400).send({
          message: 'Podaj aktualne hasło.',
        })
      }

      if (!isStrongPassword(newPassword)) {
        return reply.status(400).send({
          message:
            'Nowe hasło musi mieć co najmniej 8 znaków, wielką literę, małą literę i cyfrę.',
        })
      }

      const user = await app.prisma.user.findUnique({
        where: { id: token.userId },
      })

      if (!user) {
        return reply.status(404).send({
          message: 'Nie znaleziono użytkownika.',
        })
      }

      if (!user.passwordHash) {
        return reply.status(400).send({
          message: 'To konto nie posiada hasła. Zalogowano przez Google.',
        })
      }

      const passwordMatches = await argon2.verify(
        user.passwordHash,
        currentPassword,
      )

      if (!passwordMatches) {
        return reply.status(400).send({
          message: 'Aktualne hasło jest nieprawidłowe.',
        })
      }

      if (currentPassword === newPassword) {
        return reply.status(400).send({
          message: 'Nowe hasło musi różnić się od aktualnego.',
        })
      }

      await app.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: await argon2.hash(newPassword),
        },
      })

      return { message: 'Hasło zostało zmienione.' }
    } catch {
      return reply.status(401).send({
        message: 'Unauthorized',
      })
    }
  })

  app.get('/api/me/favorites', async (request, reply) => {
    try {
      const token = await request.jwtVerify<Token>()

      const favorites = await app.prisma.favoriteTrainer.findMany({
        where: { userId: token.userId },
        include: {
          trainer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return { favorites }
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
  })

  app.post<{ Body: { trainerId: number } }>(
    '/api/me/favorites',
    async (request, reply) => {
      try {
        const token = await request.jwtVerify<Token>()
        const trainerId = request.body.trainerId

        if (!Number.isInteger(trainerId)) {
          return reply.status(400).send({
            message: 'Nieprawidłowy trener.',
          })
        }

        const favorite = await app.prisma.favoriteTrainer.upsert({
          where: {
            userId_trainerId: {
              userId: token.userId,
              trainerId,
            },
          },
          create: {
            userId: token.userId,
            trainerId,
          },
          update: {},
        })

        return reply.status(201).send({ favorite })
      } catch {
        return reply.status(400).send({
          message: 'Nie udało się zapisać ulubionego trenera.',
        })
      }
    },
  )

  app.delete<{ Params: { trainerId: string } }>(
    '/api/me/favorites/:trainerId',
    async (request, reply) => {
      try {
        const token = await request.jwtVerify<Token>()

        await app.prisma.favoriteTrainer.delete({
          where: {
            userId_trainerId: {
              userId: token.userId,
              trainerId: Number(request.params.trainerId),
            },
          },
        })

        return { message: 'Usunięto z ulubionych.' }
      } catch {
        return reply.status(404).send({
          message: 'Nie znaleziono ulubionego trenera.',
        })
      }
    },
  )
}
