import type { FastifyInstance } from 'fastify'
import { DayOfWeek } from '../generated/prisma/client'

export async function trainerRoutes(app: FastifyInstance) {
  app.get('/api/trainers', async () => {
    const trainers = await app.prisma.trainerProfile.findMany({
      select: {
        id: true,
        bio: true,
        specialization: true,
        price: true,
        durationMinutes: true,
        location: true,

        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    })

    return {
      trainers,
    }
  })

  app.get<{ Params: { id: string } }>(
    '/api/trainers/:id',
    async (request, reply) => {
      const trainerId = Number(request.params.id)

      if (!Number.isInteger(trainerId) || trainerId <= 0) {
        return reply.status(400).send({
          message: 'Invalid trainer id',
        })
      }

      const trainer = await app.prisma.trainerProfile.findUnique({
        where: {
          id: trainerId,
        },
        select: {
          id: true,
          bio: true,
          specialization: true,
          price: true,
          durationMinutes: true,
          location: true,

          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      })

      if (!trainer) {
        return reply.status(404).send({
          message: 'Trainer not found',
        })
      }

      return {
        trainer,
      }
    },
  )

  app.get<{ Params: { id: string } }>(
    '/api/trainers/:id/availability',
    async (request, reply) => {
      const trainerId = Number(request.params.id)

      if (!Number.isInteger(trainerId) || trainerId <= 0) {
        return reply.status(400).send({
          message: 'Invalid trainer id',
        })
      }

      const trainer =
        await app.prisma.trainerProfile.findUnique({
          where: {
            id: trainerId,
          },
        })

      if (!trainer) {
        return reply.status(404).send({
          message: 'Trainer not found',
        })
      }

      const availability =
        await app.prisma.availability.findMany({
          where: {
            trainerId,
          },
          orderBy: [
            {
              dayOfWeek: 'asc',
            },
            {
              startTime: 'asc',
            },
          ],
        })

      return {
        availability,
      }
    },
  )

  app.get<{
    Params: { id: string }
    Querystring: { date: string }
  }>(
    '/api/trainers/:id/slots',
    async (request, reply) => {
      const trainerId = Number(request.params.id)
      const { date } = request.query

      if (!Number.isInteger(trainerId) || trainerId <= 0) {
        return reply.status(400).send({
          message: 'Invalid trainer id',
        })
      }

      if (!date) {
        return reply.status(400).send({
          message: 'Date is required',
        })
      }

      const selectedDate = new Date(`${date}T00:00:00`)

      if (Number.isNaN(selectedDate.getTime())) {
        return reply.status(400).send({
          message: 'Invalid date',
        })
      }

      const trainer =
        await app.prisma.trainerProfile.findUnique({
          where: {
            id: trainerId,
          },
          select: {
            id: true,
            durationMinutes: true,
          },
        })

      if (!trainer) {
        return reply.status(404).send({
          message: 'Trainer not found',
        })
      }

      if (!trainer.durationMinutes) {
        return {
          date,
          slots: [],
        }
      }

      const jsDay = selectedDate.getDay()

      const dayMap = [
        DayOfWeek.SUNDAY,
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY,
      ]

      const dayOfWeek = dayMap[jsDay]

      const availability =
        await app.prisma.availability.findMany({
          where: {
            trainerId,
            dayOfWeek,
          },
          orderBy: {
            startTime: 'asc',
          },
        })

      const dayStart = new Date(`${date}T00:00:00`)
      const dayEnd = new Date(`${date}T23:59:59.999`)

      const appointments =
        await app.prisma.appointment.findMany({
          where: {
            trainerId,
            startAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
          select: {
            startAt: true,
            endAt: true,
          },
        })

      const slots: Array<{
        startTime: string
        endTime: string
        available: boolean
      }> = []

      for (const window of availability) {
        let currentMinutes = timeToMinutes(window.startTime)
        const endMinutes = timeToMinutes(window.endTime)

        while (
          currentMinutes + trainer.durationMinutes <=
          endMinutes
        ) {
          const startTime = minutesToTime(currentMinutes)

          const endTime = minutesToTime(
            currentMinutes + trainer.durationMinutes,
          )

          const slotStart = new Date(`${date}T${startTime}:00`)
          const slotEnd = new Date(`${date}T${endTime}:00`)

          const isBooked = appointments.some(
            (appointment) =>
              slotStart < appointment.endAt &&
              slotEnd > appointment.startAt,
          )

          slots.push({
            startTime,
            endTime,
            available: !isBooked,
          })

          currentMinutes += trainer.durationMinutes
        }
      }

      return {
        date,
        slots,
      }
    },
  )
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)

  return hours * 60 + minutes
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(
    minutes,
  ).padStart(2, '0')}`
}