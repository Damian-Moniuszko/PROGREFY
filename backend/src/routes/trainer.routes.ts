import type { FastifyInstance } from 'fastify'
import { DayOfWeek } from '../generated/prisma/client'

export async function trainerRoutes(app: FastifyInstance) {
  /*
   * GET - lista trenerów
   *
   * Lekka wersja danych używana na stronie
   * "Znajdź swojego trenera".
   */

  app.get('/api/trainers', async (request, reply) => {
    try {
      const trainers =
        await app.prisma.trainerProfile.findMany({
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

            reviews: {
              select: {
                rating: true,
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },
        })

      const trainersWithRating =
        trainers.map((trainer) => {
          const reviewCount =
            trainer.reviews.length

          const averageRating =
            reviewCount > 0
              ? Number(
                  (
                    trainer.reviews.reduce(
                      (sum, review) =>
                        sum + review.rating,
                      0,
                    ) / reviewCount
                  ).toFixed(1),
                )
              : null

          const { reviews, ...trainerData } =
            trainer

          return {
            ...trainerData,
            reviewSummary: {
              averageRating,
              reviewCount,
            },
          }
        })

      return {
        trainers: trainersWithRating,
      }
    } catch (error) {
      request.log.error(error)

      return reply.status(500).send({
        message:
          'Failed to fetch trainers',
      })
    }
  })

  /*
   * GET - publiczny profil konkretnego trenera
   *
   * Zwraca wszystko, co jest potrzebne
   * do strony profilu:
   *
   * - dane podstawowe
   * - kontakt
   * - informacje "O mnie"
   * - zasady płatności
   * - zasady anulowania
   * - social media
   * - opinie
   * - średnią ocenę
   */

  app.get<{ Params: { id: string } }>(
    '/api/trainers/:id',
    async (request, reply) => {
      try {
        const trainerId = Number(
          request.params.id,
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

              bio: true,
              specialization: true,

              price: true,
              durationMinutes: true,

              location: true,

              paymentPolicy: true,
              cancellationPolicy: true,

              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,

                  avatarUrl: true,

                  email: true,
                  phone: true,
                },
              },

              socialLinks: {
                select: {
                  id: true,
                  platform: true,
                  url: true,
                },

                orderBy: {
                  id: 'asc',
                },
              },

              reviews: {
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

                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
          })

        if (!trainer) {
          return reply.status(404).send({
            message: 'Trainer not found',
          })
        }

        const reviewCount =
          trainer.reviews.length

        const averageRating =
          reviewCount > 0
            ? Number(
                (
                  trainer.reviews.reduce(
                    (sum, review) =>
                      sum + review.rating,
                    0,
                  ) / reviewCount
                ).toFixed(1),
              )
            : null

        return {
          trainer,

          reviewSummary: {
            averageRating,
            reviewCount,
          },
        }
      } catch (error) {
        request.log.error(error)

        return reply.status(500).send({
          message:
            'Failed to fetch trainer profile',
        })
      }
    },
  )

  /*
   * GET - dostępność trenera
   */

  app.get<{ Params: { id: string } }>(
    '/api/trainers/:id/availability',
    async (request, reply) => {
      try {
        const trainerId = Number(
          request.params.id,
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
      } catch (error) {
        request.log.error(error)

        return reply.status(500).send({
          message:
            'Failed to fetch trainer availability',
        })
      }
    },
  )

  /*
   * GET - dostępne sloty konkretnego dnia
   */

  app.get<{
    Params: {
      id: string
    }

    Querystring: {
      date: string
    }
  }>(
    '/api/trainers/:id/slots',
    async (request, reply) => {
      try {
        const trainerId = Number(
          request.params.id,
        )

        const { date } = request.query

        if (
          !Number.isInteger(trainerId) ||
          trainerId <= 0
        ) {
          return reply.status(400).send({
            message: 'Invalid trainer id',
          })
        }

        if (!date) {
          return reply.status(400).send({
            message: 'Date is required',
          })
        }

        /*
         * Sprawdzamy format daty.
         */

        const selectedDate = new Date(
          `${date}T00:00:00`,
        )

        if (
          Number.isNaN(
            selectedDate.getTime(),
          )
        ) {
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

        /*
         * JavaScript:
         *
         * 0 = Sunday
         * 1 = Monday
         * ...
         * 6 = Saturday
         */

        const jsDay =
          selectedDate.getDay()

        const dayMap = [
          DayOfWeek.SUNDAY,
          DayOfWeek.MONDAY,
          DayOfWeek.TUESDAY,
          DayOfWeek.WEDNESDAY,
          DayOfWeek.THURSDAY,
          DayOfWeek.FRIDAY,
          DayOfWeek.SATURDAY,
        ]

        const dayOfWeek =
          dayMap[jsDay]

        /*
         * Pobieramy godziny pracy trenera
         * dla wybranego dnia.
         */

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

        /*
         * Wszystkie istniejące wizyty
         * trenera w tym dniu.
         */

        const dayStart = new Date(
          `${date}T00:00:00`,
        )

        const dayEnd = new Date(
          `${date}T23:59:59.999`,
        )

        const appointments =
          await app.prisma.appointment.findMany({
            where: {
              trainerId,

              startAt: {
                gte: dayStart,
                lte: dayEnd,
              },

              status: {
                not: 'CANCELLED',
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

        /*
         * Tworzymy sloty na podstawie
         * dostępności trenera.
         */

        for (const window of availability) {
          let currentMinutes =
            timeToMinutes(
              window.startTime,
            )

          const endMinutes =
            timeToMinutes(
              window.endTime,
            )

          while (
            currentMinutes +
              trainer.durationMinutes <=
            endMinutes
          ) {
            const startTime =
              minutesToTime(
                currentMinutes,
              )

            const endTime =
              minutesToTime(
                currentMinutes +
                  trainer.durationMinutes,
              )

            const slotStart =
              new Date(
                `${date}T${startTime}:00`,
              )

            const slotEnd =
              new Date(
                `${date}T${endTime}:00`,
              )

            const isBooked =
              appointments.some(
                (appointment) =>
                  slotStart <
                    appointment.endAt &&
                  slotEnd >
                    appointment.startAt,
              )

            slots.push({
              startTime,
              endTime,
              available: !isBooked,
            })

            currentMinutes +=
              trainer.durationMinutes
          }
        }

        return {
          date,
          slots,
        }
      } catch (error) {
        request.log.error(error)

        return reply.status(500).send({
          message:
            'Failed to fetch trainer slots',
        })
      }
    },
  )
}

function timeToMinutes(
  time: string,
): number {
  const [hours, minutes] =
    time.split(':').map(Number)

  return hours * 60 + minutes
}

function minutesToTime(
  totalMinutes: number,
): string {
  const hours = Math.floor(
    totalMinutes / 60,
  )

  const minutes =
    totalMinutes % 60

  return `${String(hours).padStart(
    2,
    '0',
  )}:${String(minutes).padStart(2, '0')}`
}