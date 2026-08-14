import argon2 from 'argon2'
import type { FastifyInstance } from 'fastify'

type Token = { userId: number }

export async function accountRoutes(app: FastifyInstance) {
  app.get('/api/me/account', async (request, reply) => {
    try {
      const token = await request.jwtVerify<Token>()
      const user = await app.prisma.user.findUnique({ where: { id: token.userId }, select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true, gender: true } })
      return { user }
    } catch { return reply.status(401).send({ message: 'Unauthorized' }) }
  })

  app.patch<{ Body: { firstName?: string; lastName?: string; email?: string; phone?: string | null; avatarUrl?: string | null; gender?: string | null } }>('/api/me/account', async (request, reply) => {
    try {
      const token = await request.jwtVerify<Token>()
      const { firstName, lastName, email, phone, avatarUrl, gender } = request.body
      if (firstName !== undefined && !firstName.trim() || lastName !== undefined && !lastName.trim()) return reply.status(400).send({ message: 'Imię i nazwisko nie mogą być puste.' })
      const user = await app.prisma.user.update({ where: { id: token.userId }, data: { ...(firstName !== undefined && { firstName: firstName.trim() }), ...(lastName !== undefined && { lastName: lastName.trim() }), ...(email !== undefined && { email: email.trim().toLowerCase() }), ...(phone !== undefined && { phone }), ...(avatarUrl !== undefined && { avatarUrl }), ...(gender !== undefined && { gender }) }, select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true, gender: true } })
      return { user }
    } catch (error) { return reply.status(400).send({ message: error instanceof Error && error.message.includes('Unique') ? 'Ten e-mail jest już używany.' : 'Nie udało się zapisać zmian.' }) }
  })

  app.patch<{ Body: { currentPassword: string; newPassword: string } }>('/api/me/password', async (request, reply) => {
    try { const token = await request.jwtVerify<Token>(); const user = await app.prisma.user.findUnique({ where: { id: token.userId } }); if (!user || !await argon2.verify(user.passwordHash, request.body.currentPassword) || request.body.newPassword.length < 8) return reply.status(400).send({ message: 'Sprawdź aktualne hasło; nowe musi mieć co najmniej 8 znaków.' }); await app.prisma.user.update({ where: { id: user.id }, data: { passwordHash: await argon2.hash(request.body.newPassword) } }); return { message: 'Hasło zmienione.' } } catch { return reply.status(401).send({ message: 'Unauthorized' }) }
  })

  app.get('/api/me/favorites', async (request, reply) => {
    try { const token = await request.jwtVerify<Token>(); const favorites = await app.prisma.favoriteTrainer.findMany({ where: { userId: token.userId }, include: { trainer: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } } }, orderBy: { createdAt: 'desc' } }); return { favorites } } catch { return reply.status(401).send({ message: 'Unauthorized' }) }
  })
  app.post<{ Body: { trainerId: number } }>('/api/me/favorites', async (request, reply) => {
    try { const token = await request.jwtVerify<Token>(); const trainerId = request.body.trainerId; if (!Number.isInteger(trainerId)) return reply.status(400).send({ message: 'Nieprawidłowy trener.' }); const favorite = await app.prisma.favoriteTrainer.upsert({ where: { userId_trainerId: { userId: token.userId, trainerId } }, create: { userId: token.userId, trainerId }, update: {} }); return reply.status(201).send({ favorite }) } catch { return reply.status(400).send({ message: 'Nie udało się zapisać ulubionego trenera.' }) }
  })
  app.delete<{ Params: { trainerId: string } }>('/api/me/favorites/:trainerId', async (request, reply) => {
    try { const token = await request.jwtVerify<Token>(); await app.prisma.favoriteTrainer.delete({ where: { userId_trainerId: { userId: token.userId, trainerId: Number(request.params.trainerId) } } }); return { message: 'Usunięto z ulubionych.' } } catch { return reply.status(404).send({ message: 'Nie znaleziono ulubionego trenera.' }) }
  })
}
