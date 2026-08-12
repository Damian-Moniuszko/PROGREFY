import type { FastifyInstance } from 'fastify'
import {
  DayOfWeek,
  UserRole,
} from '../generated/prisma/client'

interface TrainerProfileBody {
  bio?: string
  specialization?: string
  price?: number
  durationMinutes?: number
  location?: string
}

interface AvailabilityBody {
  dayOfWeek: string
  startTime: string
  endTime: string
}

export async function profileRoutes(app: FastifyInstance) {
  app.patch<{ Body: TrainerProfileBody }>(
    '/api/me/trainer-profile',
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number
          role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.TRAINER) {
          return reply.status(403).send({
            message: 'Only trainers can update trainer profile',
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

        const {
          bio,
          specialization,
          price,
          durationMinutes,
          location,
        } = request.body

        const updatedProfile =
          await app.prisma.trainerProfile.update({
            where: {
              userId: decoded.userId,
            },
            data: {
              ...(bio !== undefined && { bio }),
              ...(specialization !== undefined && {
                specialization,
              }),
              ...(price !== undefined && { price }),
              ...(durationMinutes !== undefined && {
                durationMinutes,
              }),
              ...(location !== undefined && { location }),
            },
          })

        return {
          message: 'Trainer profile updated successfully',
          profile: updatedProfile,
        }
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  app.post<{ Body: AvailabilityBody }>(
    '/api/me/availability',
    async (request, reply) => {
        try {
        const decoded = await request.jwtVerify<{
            userId: number
            role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.TRAINER) {
            return reply.status(403).send({
            message: 'Only trainers can manage availability',
            })
        }

        const {
            dayOfWeek,
            startTime,
            endTime,
        } = request.body

        if (!Object.values(DayOfWeek).includes(dayOfWeek as DayOfWeek)) {
        return reply.status(400).send({
            message: 'Invalid dayOfWeek',
        })
        }

        if (!startTime || !endTime) {
            return reply.status(400).send({
            message: 'startTime and endTime are required',
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

        const availability =
            await app.prisma.availability.create({
            data: {
                trainerId: trainerProfile.id,
                dayOfWeek: dayOfWeek as DayOfWeek,
                startTime,
                endTime,
            },
            })

        return reply.status(201).send({
            message: 'Availability created successfully',
            availability,
        })
        } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
            message: 'Unauthorized',
        })
        }
    },
    )

    app.get(
    '/api/me/availability',
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number
          role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.TRAINER) {
          return reply.status(403).send({
            message:
              'Only trainers can access availability',
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

        const availability =
          await app.prisma.availability.findMany({
            where: {
              trainerId: trainerProfile.id,
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
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  app.delete<{
    Params: {
      id: string
    }
  }>(
    '/api/me/availability/:id',
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number
          role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.TRAINER) {
          return reply.status(403).send({
            message:
              'Only trainers can manage availability',
          })
        }

        const availabilityId = Number(
          request.params.id,
        )

        if (
          !Number.isInteger(availabilityId) ||
          availabilityId <= 0
        ) {
          return reply.status(400).send({
            message: 'Invalid availability id',
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

        const availability =
          await app.prisma.availability.findUnique({
            where: {
              id: availabilityId,
            },
          })

        if (!availability) {
          return reply.status(404).send({
            message: 'Availability not found',
          })
        }

        if (
          availability.trainerId !== trainerProfile.id
        ) {
          return reply.status(403).send({
            message:
              'You can only delete your own availability',
          })
        }

        await app.prisma.availability.delete({
          where: {
            id: availabilityId,
          },
        })

        return {
          message:
            'Availability deleted successfully',
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

