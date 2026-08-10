import type { FastifyInstance } from 'fastify'
import { AppointmentStatus, UserRole } from '../generated/prisma/client'

interface CreateAppointmentBody {
  trainerId: number
  startAt: string
  endAt: string
}

export async function appointmentRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateAppointmentBody }>(
    '/api/appointments',
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number
          role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.CLIENT) {
          return reply.status(403).send({
            message: 'Only clients can create appointments',
          })
        }

        const { trainerId, startAt, endAt } = request.body

        if (!trainerId || !startAt || !endAt) {
          return reply.status(400).send({
            message: 'trainerId, startAt and endAt are required',
          })
        }

        const start = new Date(startAt)
        const end = new Date(endAt)

        if (
          Number.isNaN(start.getTime()) ||
          Number.isNaN(end.getTime())
        ) {
          return reply.status(400).send({
            message: 'Invalid date',
          })
        }

        if (start >= end) {
          return reply.status(400).send({
            message: 'endAt must be after startAt',
          })
        }

        const clientProfile =
          await app.prisma.clientProfile.findUnique({
            where: {
              userId: decoded.userId,
            },
          })

        if (!clientProfile) {
          return reply.status(404).send({
            message: 'Client profile not found',
          })
        }

        const trainer =
          await app.prisma.trainerProfile.findUnique({
            where: {
              id: trainerId,
            },
            select: {
              id: true,
              price: true,
              durationMinutes: true,
            },
          })

        if (!trainer) {
          return reply.status(404).send({
            message: 'Trainer not found',
          })
        }

        if (trainer.price === null) {
            return reply.status(400).send({
                message: 'Trainer has not set a price',
            })
        }

        const duration =
          (end.getTime() - start.getTime()) / 60000

        if (duration !== trainer.durationMinutes) {
          return reply.status(400).send({
            message: 'Invalid appointment duration',
          })
        }

        const overlappingAppointment =
          await app.prisma.appointment.findFirst({
            where: {
              trainerId,
              startAt: {
                lt: end,
              },
              endAt: {
                gt: start,
              },
            },
          })

        if (overlappingAppointment) {
          return reply.status(409).send({
            message: 'This time slot is already booked',
          })
        }

        const appointment =
          await app.prisma.appointment.create({
            data: {
              clientId: clientProfile.id,
              trainerId: trainer.id,
              startAt: start,
              endAt: end,
              price: trainer.price,
              status: AppointmentStatus.PENDING,
            },
          })

        return reply.status(201).send({
          message: 'Appointment created successfully',
          appointment,
        })
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  app.get('/api/me/appointments', async (request, reply) => {
    try {
        const decoded = await request.jwtVerify<{
        userId: number
        role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.CLIENT) {
        return reply.status(403).send({
            message: 'Only clients can access client appointments',
        })
        }

        const clientProfile =
        await app.prisma.clientProfile.findUnique({
            where: {
            userId: decoded.userId,
            },
        })

        if (!clientProfile) {
        return reply.status(404).send({
            message: 'Client profile not found',
        })
        }

        const appointments =
        await app.prisma.appointment.findMany({
            where: {
            clientId: clientProfile.id,
            },

            orderBy: {
            startAt: 'asc',
            },

            select: {
            id: true,
            startAt: true,
            endAt: true,
            price: true,
            status: true,

            trainer: {
                select: {
                id: true,

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
        })

        return {
        appointments,
        }
    } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
        message: 'Unauthorized',
        })
    }
    })

    app.get(
    '/api/me/trainer-appointments',
    async (request, reply) => {
        try {
        const decoded = await request.jwtVerify<{
            userId: number
            role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.TRAINER) {
            return reply.status(403).send({
            message: 'Only trainers can access trainer appointments',
            })
        }

        const trainerProfile =
            await app.prisma.trainerProfile.findUnique({
            where: {
                userId: decoded.userId,
            },
            })

        if (!trainerProfile) {
            return reply.status(404).send({
            message: 'Trainer profile not found',
            })
        }

        const appointments =
            await app.prisma.appointment.findMany({
            where: {
                trainerId: trainerProfile.id,
            },

            orderBy: {
                startAt: 'asc',
            },

            select: {
                id: true,
                startAt: true,
                endAt: true,
                price: true,
                status: true,

                client: {
                select: {
                    id: true,

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
            })

        return {
            appointments,
        }
        } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
            message: 'Unauthorized',
        })
        }
    },
    )
}