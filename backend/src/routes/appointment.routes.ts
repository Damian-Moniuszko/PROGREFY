import type { FastifyInstance } from 'fastify'
import {
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
  UserRole,
} from '../generated/prisma/client'

interface CreateAppointmentBody {
  trainerId: number
  startAt: string
  endAt: string
  paymentMethod?: PaymentMethod
}

interface UpdateAppointmentStatusBody {
  status:
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'COMPLETED'
}

interface CreateReviewBody {
  appointmentId: number
  rating: number
  comment?: string
}

export async function appointmentRoutes(
  app: FastifyInstance,
) {
  /*
   * CREATE APPOINTMENT
   */

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
            message:
              'Only clients can create appointments',
          })
        }

        const {
          trainerId,
          startAt,
          endAt,
          paymentMethod = PaymentMethod.CARD,
        } = request.body

        if (!trainerId || !startAt || !endAt) {
          return reply.status(400).send({
            message:
              'trainerId, startAt and endAt are required',
          })
        }

        if (
          !Object.values(PaymentMethod).includes(
            paymentMethod,
          )
        ) {
          return reply.status(400).send({
            message: 'Invalid payment method',
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

        if (trainer.durationMinutes === null) {
          return reply.status(400).send({
            message:
              'Trainer has not set training duration',
          })
        }

        const trainerPrice = trainer.price
        const trainerDuration =
          trainer.durationMinutes

        const duration =
          (end.getTime() - start.getTime()) /
          60000

        if (duration !== trainerDuration) {
          return reply.status(400).send({
            message:
              'Invalid appointment duration',
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
              status: {
                not: AppointmentStatus.CANCELLED,
              },
            },
          })

        if (overlappingAppointment) {
          return reply.status(409).send({
            message:
              'This time slot is already booked',
          })
        }

        /*
         * Appointment + Payment are created
         * together in one database transaction.
         */

        const result =
          await app.prisma.$transaction(
            async (tx) => {
              const appointment =
                await tx.appointment.create({
                  data: {
                    clientId: clientProfile.id,
                    trainerId: trainer.id,
                    startAt: start,
                    endAt: end,
                    price: trainerPrice,
                    status:
                      AppointmentStatus.PENDING,
                  },
                })

              const payment =
                await tx.payment.create({
                  data: {
                    appointmentId:
                      appointment.id,
                    amount: trainerPrice,
                    status:
                      PaymentStatus.PENDING,
                    method: paymentMethod,
                    provider: 'TEST',
                  },
                })

              return {
                appointment,
                payment,
              }
            },
          )

        return reply.status(201).send({
          message:
            'Appointment created successfully',
          appointment: result.appointment,
          payment: result.payment,
        })
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  /*
   * CLIENT APPOINTMENTS
   */

  app.get(
    '/api/me/appointments',
    async (request, reply) => {
      try {
        const decoded =
          await request.jwtVerify<{
            userId: number
            role: 'CLIENT' | 'TRAINER'
          }>()

        if (decoded.role !== UserRole.CLIENT) {
          return reply.status(403).send({
            message:
              'Only clients can access client appointments',
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
            message:
              'Client profile not found',
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

              payment: {
                select: {
                  id: true,
                  amount: true,
                  status: true,
                  method: true,
                  provider: true,
                  providerPaymentId: true,
                },
              },

              review: {
                select: {
                  id: true,
                  rating: true,
                  comment: true,
                  createdAt: true,
                },
              },

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
    },
  )

  /*
   * CLIENT TEST PAYMENT
   */

  app.post<{
    Params: {
      id: string
    }
  }>(
    '/api/me/appointments/:id/payment',
    async (request, reply) => {
      try {
        const decoded =
          await request.jwtVerify<{
            userId: number
            role: 'CLIENT' | 'TRAINER'
          }>()

        if (decoded.role !== UserRole.CLIENT) {
          return reply.status(403).send({
            message:
              'Only clients can pay for appointments',
          })
        }

        const appointmentId = Number(
          request.params.id,
        )

        if (
          !Number.isInteger(appointmentId) ||
          appointmentId <= 0
        ) {
          return reply.status(400).send({
            message: 'Invalid appointment id',
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
            message:
              'Client profile not found',
          })
        }

        const appointment =
          await app.prisma.appointment.findUnique({
            where: {
              id: appointmentId,
            },
            include: {
              payment: true,
            },
          })

        if (!appointment) {
          return reply.status(404).send({
            message: 'Appointment not found',
          })
        }

        if (
          appointment.clientId !==
          clientProfile.id
        ) {
          return reply.status(403).send({
            message:
              'You can only pay for your own appointments',
          })
        }

        if (
          appointment.status ===
            AppointmentStatus.CANCELLED ||
          appointment.status ===
            AppointmentStatus.COMPLETED
        ) {
          return reply.status(400).send({
            message:
              'This appointment cannot be paid for',
          })
        }

        if (!appointment.payment) {
          return reply.status(404).send({
            message:
              'Payment not found for this appointment',
          })
        }

        if (
          appointment.payment.status ===
          PaymentStatus.PAID
        ) {
          return reply.status(400).send({
            message:
              'Appointment has already been paid',
          })
        }

        if (
          appointment.payment.status ===
          PaymentStatus.REFUNDED
        ) {
          return reply.status(400).send({
            message:
              'This payment has already been refunded',
          })
        }

        /*
         * TEST PAYMENT
         *
         * No real money is charged.
         */

        const payment =
          await app.prisma.payment.update({
            where: {
              id: appointment.payment.id,
            },
            data: {
              status: PaymentStatus.PAID,
              provider: 'TEST',
              providerPaymentId:
                `test_${appointment.id}_${Date.now()}`,
            },
          })

        return {
          message:
            'Test payment completed successfully',
          payment,
        }
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  /*
   * TRAINER APPOINTMENTS
   */

  app.get(
    '/api/me/trainer-appointments',
    async (request, reply) => {
      try {
        const decoded =
          await request.jwtVerify<{
            userId: number
            role: 'CLIENT' | 'TRAINER'
          }>()

        if (decoded.role !== UserRole.TRAINER) {
          return reply.status(403).send({
            message:
              'Only trainers can access trainer appointments',
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
            message:
              'Trainer profile not found',
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

              payment: {
                select: {
                  id: true,
                  amount: true,
                  status: true,
                  method: true,
                  provider: true,
                },
              },

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

  /*
   * TRAINER APPOINTMENT STATUS
   */

  app.patch<{
    Params: {
      id: string
    }
    Body: UpdateAppointmentStatusBody
  }>(
    '/api/me/trainer-appointments/:id/status',
    async (request, reply) => {
      try {
        const decoded =
          await request.jwtVerify<{
            userId: number
            role: 'CLIENT' | 'TRAINER'
          }>()

        if (decoded.role !== UserRole.TRAINER) {
          return reply.status(403).send({
            message:
              'Only trainers can update appointment status',
          })
        }

        const appointmentId = Number(
          request.params.id,
        )

        if (
          !Number.isInteger(appointmentId) ||
          appointmentId <= 0
        ) {
          return reply.status(400).send({
            message: 'Invalid appointment id',
          })
        }

        const { status } = request.body

        if (
          status !== AppointmentStatus.CONFIRMED &&
          status !== AppointmentStatus.CANCELLED &&
          status !== AppointmentStatus.COMPLETED
        ) {
          return reply.status(400).send({
            message:
              'Status must be CONFIRMED, CANCELLED or COMPLETED',
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
            message:
              'Trainer profile not found',
          })
        }

        const appointment =
          await app.prisma.appointment.findUnique({
            where: {
              id: appointmentId,
            },
            include: {
              payment: true,
            },
          })

        if (!appointment) {
          return reply.status(404).send({
            message: 'Appointment not found',
          })
        }

        if (
          appointment.trainerId !==
          trainerProfile.id
        ) {
          return reply.status(403).send({
            message:
              'You can only update your own appointments',
          })
        }

        /*
         * CONFIRM
         *
         * Trainer can only confirm a paid appointment.
         */

        if (
          status ===
          AppointmentStatus.CONFIRMED
        ) {
          if (
            appointment.status !==
            AppointmentStatus.PENDING
          ) {
            return reply.status(400).send({
              message:
                'Only pending appointments can be confirmed',
            })
          }

          if (
            !appointment.payment ||
            appointment.payment.status !==
              PaymentStatus.PAID
          ) {
            return reply.status(400).send({
              message:
                'Appointment must be paid before it can be confirmed',
            })
          }
        }

        /*
         * CANCEL
         */

        if (
          status ===
          AppointmentStatus.CANCELLED
        ) {
          if (
            appointment.status !==
            AppointmentStatus.PENDING
          ) {
            return reply.status(400).send({
              message:
                'Only pending appointments can be cancelled',
            })
          }
        }

        /*
         * COMPLETE
         */

        if (
          status ===
          AppointmentStatus.COMPLETED
        ) {
          if (
            appointment.status !==
            AppointmentStatus.CONFIRMED
          ) {
            return reply.status(400).send({
              message:
                'Only confirmed appointments can be completed',
            })
          }

          if (appointment.endAt > new Date()) {
            return reply.status(400).send({
              message:
                'Appointment cannot be completed before it ends',
            })
          }
        }

        const updatedAppointment =
          await app.prisma.appointment.update({
            where: {
              id: appointment.id,
            },
            data: {
              status,
            },
          })

        return {
          message:
            'Appointment status updated successfully',
          appointment:
            updatedAppointment,
        }
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  /*
   * CLIENT CANCEL APPOINTMENT
   */

  app.patch<{
    Params: {
      id: string
    }
  }>(
    '/api/me/appointments/:id/cancel',
    async (request, reply) => {
      try {
        const decoded =
          await request.jwtVerify<{
            userId: number
            role: 'CLIENT' | 'TRAINER'
          }>()

        if (decoded.role !== UserRole.CLIENT) {
          return reply.status(403).send({
            message:
              'Only clients can cancel appointments',
          })
        }

        const appointmentId = Number(
          request.params.id,
        )

        if (
          !Number.isInteger(appointmentId) ||
          appointmentId <= 0
        ) {
          return reply.status(400).send({
            message: 'Invalid appointment id',
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
            message:
              'Client profile not found',
          })
        }

        const appointment =
          await app.prisma.appointment.findUnique({
            where: {
              id: appointmentId,
            },
            include: {
              payment: true,
            },
          })

        if (!appointment) {
          return reply.status(404).send({
            message: 'Appointment not found',
          })
        }

        if (
          appointment.clientId !==
          clientProfile.id
        ) {
          return reply.status(403).send({
            message:
              'You can only cancel your own appointments',
          })
        }

        if (
          appointment.status !==
            AppointmentStatus.PENDING &&
          appointment.status !==
            AppointmentStatus.CONFIRMED
        ) {
          return reply.status(400).send({
            message:
              'Only pending or confirmed appointments can be cancelled',
          })
        }

        const result =
          await app.prisma.$transaction(
            async (tx) => {
              const updatedAppointment =
                await tx.appointment.update({
                  where: {
                    id: appointment.id,
                  },
                  data: {
                    status:
                      AppointmentStatus.CANCELLED,
                  },
                })

              let payment = null

              if (
                appointment.payment &&
                appointment.payment.status ===
                  PaymentStatus.PAID
              ) {
                payment =
                  await tx.payment.update({
                    where: {
                      id: appointment.payment.id,
                    },
                    data: {
                      status:
                        PaymentStatus.REFUNDED,
                    },
                  })
              }

              return {
                updatedAppointment,
                payment,
              }
            },
          )

        return {
          message:
            'Appointment cancelled successfully',
          appointment:
            result.updatedAppointment,
          payment: result.payment,
        }
      } catch (error) {
        request.log.error(error)

        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }
    },
  )

  /*
   * GET TRAINER REVIEWS
   *
   * Public endpoint.
   *
   * Returns:
   * - reviews
   * - average rating
   * - total number of reviews
   */

  app.get<{
    Params: {
      trainerId: string
    }
  }>(
    '/api/trainers/:trainerId/reviews',
    async (request, reply) => {
      try {
        const trainerId = Number(
          request.params.trainerId,
        )

        if (
          !Number.isInteger(trainerId) ||
          trainerId <= 0
        ) {
          return reply.status(400).send({
            message: 'Invalid trainer id',
          })
        }

        const trainer =
          await app.prisma.trainerProfile.findUnique({
            where: {
              id: trainerId,
            },
            select: {
              id: true,
            },
          })

        if (!trainer) {
          return reply.status(404).send({
            message: 'Trainer not found',
          })
        }

        const reviews =
          await app.prisma.review.findMany({
            where: {
              trainerId,
            },

            orderBy: {
              createdAt: 'desc',
            },

            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,

              client: {
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

        const totalReviews = reviews.length

        const averageRating =
          totalReviews > 0
            ? reviews.reduce(
                (sum, review) =>
                  sum + review.rating,
                0,
              ) / totalReviews
            : 0

        return {
          reviews,
          summary: {
            averageRating:
              Math.round(
                averageRating * 10,
              ) / 10,
            totalReviews,
          },
        }
      } catch (error) {
        request.log.error(error)

        return reply.status(500).send({
          message:
            'Failed to fetch trainer reviews',
        })
      }
    },
  )

  /*
   * REVIEWABLE APPOINTMENTS
   *
   * Returns completed appointments
   * that do not have a review yet.
   *
   * Only the logged-in client can access them.
   */

  app.get(
    '/api/me/reviewable-appointments',
    async (request, reply) => {
      try {
        const decoded =
          await request.jwtVerify<{
            userId: number
            role: 'CLIENT' | 'TRAINER'
          }>()

        if (decoded.role !== UserRole.CLIENT) {
          return reply.status(403).send({
            message:
              'Only clients can access reviewable appointments',
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
            message:
              'Client profile not found',
          })
        }

        const appointments =
          await app.prisma.appointment.findMany({
            where: {
              clientId: clientProfile.id,
              status:
                AppointmentStatus.COMPLETED,
              endAt: {
                lte: new Date(),
              },
              review: null,
            },

            orderBy: {
              endAt: 'desc',
            },

            select: {
              id: true,
              startAt: true,
              endAt: true,
              price: true,

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
    },
  )

  /*
   * CREATE REVIEW
   *
   * Only a client who actually completed
   * a training with the trainer can review it.
   */

  app.post<{ Body: CreateReviewBody }>(
    '/api/me/reviews',
    async (request, reply) => {
      try {
        const decoded =
          await request.jwtVerify<{
            userId: number
            role: 'CLIENT' | 'TRAINER'
          }>()

        if (decoded.role !== UserRole.CLIENT) {
          return reply.status(403).send({
            message:
              'Only clients can create reviews',
          })
        }

        const {
          appointmentId,
          rating,
          comment,
        } = request.body

        if (
          !appointmentId ||
          !Number.isInteger(appointmentId)
        ) {
          return reply.status(400).send({
            message:
              'Valid appointmentId is required',
          })
        }

        if (
          !Number.isInteger(rating) ||
          rating < 1 ||
          rating > 5
        ) {
          return reply.status(400).send({
            message:
              'Rating must be an integer between 1 and 5',
          })
        }

        if (
          comment !== undefined &&
          typeof comment !== 'string'
        ) {
          return reply.status(400).send({
            message:
              'Comment must be a string',
          })
        }

        const cleanComment =
          comment?.trim() || null

        if (
          cleanComment &&
          cleanComment.length > 2000
        ) {
          return reply.status(400).send({
            message:
              'Comment cannot exceed 2000 characters',
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
            message:
              'Client profile not found',
          })
        }

        const appointment =
          await app.prisma.appointment.findUnique({
            where: {
              id: appointmentId,
            },
            select: {
              id: true,
              clientId: true,
              trainerId: true,
              startAt: true,
              endAt: true,
              status: true,

              review: {
                select: {
                  id: true,
                },
              },
            },
          })

        if (!appointment) {
          return reply.status(404).send({
            message: 'Appointment not found',
          })
        }

        /*
         * Make sure the appointment belongs
         * to the logged-in client.
         */

        if (
          appointment.clientId !==
          clientProfile.id
        ) {
          return reply.status(403).send({
            message:
              'You can only review your own appointments',
          })
        }

        /*
         * The appointment must have been completed.
         */

        if (
          appointment.status !==
          AppointmentStatus.COMPLETED
        ) {
          return reply.status(400).send({
            message:
              'You can only review completed appointments',
          })
        }

        /*
         * Extra protection:
         * the training must actually be finished.
         */

        if (appointment.endAt > new Date()) {
          return reply.status(400).send({
            message:
              'You cannot review an appointment before it ends',
          })
        }

        /*
         * One review per appointment.
         */

        if (appointment.review) {
          return reply.status(409).send({
            message:
              'You have already reviewed this appointment',
          })
        }

        const review =
          await app.prisma.review.create({
            data: {
              trainerId:
                appointment.trainerId,
              clientId:
                clientProfile.id,
              appointmentId:
                appointment.id,
              rating,
              comment: cleanComment,
            },

            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,

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

        return reply.status(201).send({
          message:
            'Review created successfully',
          review,
        })
      } catch (error) {
        request.log.error(error)

        return reply.status(500).send({
          message:
            'Failed to create review',
        })
      }
    },
  )
}