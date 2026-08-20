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
  phone?: string
  paymentPolicy?: string
  cancellationPolicy?: string
}

interface SocialLinkBody {
  platform: string
  url: string
}

interface AvailabilityBody {
  dayOfWeek: string
  startTime: string
  endTime: string
}

export async function profileRoutes(
  app: FastifyInstance,
) {
  // GET - pobranie profilu zalogowanego trenera
  app.get(
    '/api/me/trainer-profile',
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number
          role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.TRAINER) {
          return reply.status(403).send({
            message:
              'Only trainers can access trainer profile',
          })
        }

        const trainerProfile =
          await app.prisma.trainerProfile.findUnique({
            where: {
              userId: decoded.userId,
            },
            select: {
              id: true,
              userId: true,
              bio: true,
              specialization: true,
              price: true,
              durationMinutes: true,
              location: true,
              paymentPolicy: true,
              cancellationPolicy: true,

              user: {
                select: {
                  phone: true,
                },
              },
            },
          })

        if (!trainerProfile) {
          return reply.status(404).send({
            message: 'Trainer profile not found',
          })
        }

        return {
          profile: {
            id: trainerProfile.id,
            userId: trainerProfile.userId,
            bio: trainerProfile.bio,
            specialization: trainerProfile.specialization,
            price: trainerProfile.price,
            durationMinutes:
              trainerProfile.durationMinutes,
            location: trainerProfile.location,
            paymentPolicy:
              trainerProfile.paymentPolicy,
            cancellationPolicy:
              trainerProfile.cancellationPolicy,
            phone: trainerProfile.user.phone,
          },
        }
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  // PATCH - aktualizacja profilu trenera
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
            message:
              'Only trainers can update trainer profile',
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
          phone,
          paymentPolicy,
          cancellationPolicy,
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

              ...(price !== undefined && {
                price,
              }),

              ...(durationMinutes !== undefined && {
                durationMinutes,
              }),

              ...(location !== undefined && {
                location,
              }),

              ...(paymentPolicy !== undefined && {
                paymentPolicy,
              }),

              ...(cancellationPolicy !== undefined && {
                cancellationPolicy,
              }),
            },
          })

        if (phone !== undefined) {
          await app.prisma.user.update({
            where: {
              id: decoded.userId,
            },
            data: {
              phone,
            },
          })
        }

        const updatedUser =
          await app.prisma.user.findUnique({
            where: {
              id: decoded.userId,
            },
            select: {
              phone: true,
            },
          })

        return {
          message:
            'Trainer profile updated successfully',

          profile: {
            ...updatedProfile,
            phone: updatedUser?.phone ?? null,
          },
        }
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  // GET - social media trenera
  app.get(
    '/api/me/social-links',
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number
          role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.TRAINER) {
          return reply.status(403).send({
            message:
              'Only trainers can access social links',
          })
        }

        const trainerProfile =
          await app.prisma.trainerProfile.findUnique({
            where: {
              userId: decoded.userId,
            },
            select: {
              id: true,
            },
          })

        if (!trainerProfile) {
          return reply.status(404).send({
            message: 'Trainer profile not found',
          })
        }

        const socialLinks =
          await app.prisma.trainerSocialLink.findMany({
            where: {
              trainerId: trainerProfile.id,
            },
            orderBy: {
              id: 'asc',
            },
          })

        return {
          socialLinks,
        }
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  // POST - dodanie / aktualizacja social media
  app.post<{ Body: SocialLinkBody }>(
    '/api/me/social-links',
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number
          role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.TRAINER) {
          return reply.status(403).send({
            message:
              'Only trainers can manage social links',
          })
        }

        const {
          platform,
          url,
        } = request.body

        if (!platform || !url) {
          return reply.status(400).send({
            message:
              'platform and url are required',
          })
        }

        const trainerProfile =
          await app.prisma.trainerProfile.findUnique({
            where: {
              userId: decoded.userId,
            },
            select: {
              id: true,
            },
          })

        if (!trainerProfile) {
          return reply.status(404).send({
            message: 'Trainer profile not found',
          })
        }

        const socialLink =
          await app.prisma.trainerSocialLink.upsert({
            where: {
              trainerId_platform: {
                trainerId: trainerProfile.id,
                platform,
              },
            },
            update: {
              url,
            },
            create: {
              trainerId: trainerProfile.id,
              platform,
              url,
            },
          })

        return reply.status(201).send({
          message:
            'Social link saved successfully',
          socialLink,
        })
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  // DELETE - usunięcie social media
  app.delete<{
    Params: {
      id: string
    }
  }>(
    '/api/me/social-links/:id',
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number
          role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.TRAINER) {
          return reply.status(403).send({
            message:
              'Only trainers can manage social links',
          })
        }

        const socialLinkId = Number(
          request.params.id,
        )

        if (
          !Number.isInteger(socialLinkId) ||
          socialLinkId <= 0
        ) {
          return reply.status(400).send({
            message: 'Invalid social link id',
          })
        }

        const trainerProfile =
          await app.prisma.trainerProfile.findUnique({
            where: {
              userId: decoded.userId,
            },
            select: {
              id: true,
            },
          })

        if (!trainerProfile) {
          return reply.status(404).send({
            message: 'Trainer profile not found',
          })
        }

        const socialLink =
          await app.prisma.trainerSocialLink.findUnique({
            where: {
              id: socialLinkId,
            },
          })

        if (!socialLink) {
          return reply.status(404).send({
            message: 'Social link not found',
          })
        }

        if (
          socialLink.trainerId !==
          trainerProfile.id
        ) {
          return reply.status(403).send({
            message:
              'You can only delete your own social links',
          })
        }

        await app.prisma.trainerSocialLink.delete({
          where: {
            id: socialLinkId,
          },
        })

        return {
          message:
            'Social link deleted successfully',
        }
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  // POST - dodanie dostępności
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
            message:
              'Only trainers can manage availability',
          })
        }

        const {
          dayOfWeek,
          startTime,
          endTime,
        } = request.body

        if (
          !Object.values(DayOfWeek).includes(
            dayOfWeek as DayOfWeek,
          )
        ) {
          return reply.status(400).send({
            message: 'Invalid dayOfWeek',
          })
        }

        if (!startTime || !endTime) {
          return reply.status(400).send({
            message:
              'startTime and endTime are required',
          })
        }

        if (startTime >= endTime) {
          return reply.status(400).send({
            message:
              'startTime must be before endTime',
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
              dayOfWeek:
                dayOfWeek as DayOfWeek,
              startTime,
              endTime,
            },
          })

        return reply.status(201).send({
          message:
            'Availability created successfully',
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

  // GET - pobranie dostępności trenera
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

  // DELETE - usunięcie dostępności
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
          availability.trainerId !==
          trainerProfile.id
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

  // GET - opinie wystawione przez zalogowanego klienta
  app.get(
    '/api/me/reviews',
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number
          role: 'CLIENT' | 'TRAINER'
        }>()

        if (decoded.role !== UserRole.CLIENT) {
          return reply.status(403).send({
            message: 'Only clients can access reviews',
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

        const reviews =
          await app.prisma.review.findMany({
            where: {
              clientId: clientProfile.id,
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              trainer: {
                select: {
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
          reviews,
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