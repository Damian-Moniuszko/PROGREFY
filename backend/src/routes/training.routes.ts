import { getUserExerciseProgress, getUserWorkoutHistory } from "../services/training.service";
import type { FastifyInstance } from "fastify";

export async function trainingRoutes(app: FastifyInstance) {
  app.get(
    "/api/training/dashboard",
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number;
          role: "CLIENT" | "TRAINER";
        }>();

        if (decoded.role !== "CLIENT") {
          return reply.status(403).send({
            message: "Dostęp tylko dla klientów",
          });
        }

        const user = await app.prisma.user.findUnique({
          where: {
            id: decoded.userId,
          },
          include: {
            clientProfile: true,
          },
        });

        if (!user) {
          return reply.status(404).send({
            message: "Nie znaleziono użytkownika",
          });
        }

        if (!user.clientProfile) {
          return reply.status(400).send({
            message: "Brak profilu klienta",
          });
        }

        const nextAppointment =
          await app.prisma.appointment.findFirst({
            where: {
              clientId: user.clientProfile.id,
              status: "CONFIRMED",
              startAt: {
                gte: new Date(),
              },
            },
            include: {
              trainer: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: {
              startAt: "asc",
            },
          });

        const currentPlan =
          await app.prisma.workoutPlan.findFirst({
            where: {
              clientId: user.clientProfile.id,
            },
            include: {
              workouts: {
                orderBy: {
                  order: "asc",
                },
                include: {
                  exercises: {
                    orderBy: {
                      order: "asc",
                    },
                    include: {
                      exercise: true,
                    },
                  },
                },
              },
            },
          });

        const lastWorkout =
          await app.prisma.workoutSession.findFirst({
            where: {
              clientId: user.clientProfile.id,
            },
            orderBy: {
              startedAt: "desc",
            },
            include: {
              workout: true,
            },
          });

        return {
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
          },

          nextAppointment: nextAppointment
            ? {
                date: nextAppointment.startAt,
                trainer:
                  `${nextAppointment.trainer.user.firstName} ${nextAppointment.trainer.user.lastName}`,
              }
            : null,

          currentPlan,

          lastWorkout: lastWorkout
            ? {
                date: lastWorkout.startedAt,
                workout:
                  lastWorkout.workout?.name ?? "Trening",
              }
            : null,
        };
      } catch (error) {
        request.log.error(error);

        return reply.status(500).send({
          message: "Błąd serwera",
        });
      }
    }
  );

  app.get(
    "/api/training/history",
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number;
          role: "CLIENT" | "TRAINER";
        }>();

        if (decoded.role !== "CLIENT") {
          return reply.status(403).send({
            message: "Dostęp tylko dla klientów",
          });
        }

        const user = await app.prisma.user.findUnique({
          where: {
            id: decoded.userId,
          },
          include: {
            clientProfile: true,
          },
        });

        if (!user?.clientProfile) {
          return reply.status(404).send({
            message: "Nie znaleziono profilu klienta",
          });
        }

        const sessions = await getUserWorkoutHistory(
          app,
          user.clientProfile.id
        );

        return {
          sessions,
        };
      } catch (error) {
        request.log.error(error);

        return reply.status(500).send({
          message: "Błąd serwera",
        });
      }
    }
  );


  app.get(
    "/api/training/progress",
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number;
          role: "CLIENT" | "TRAINER";
        }>();

        if (decoded.role !== "CLIENT") {
          return reply.status(403).send({
            message: "Dostęp tylko dla klientów",
          });
        }

        const user = await app.prisma.user.findUnique({
          where: {
            id: decoded.userId,
          },
          include: {
            clientProfile: true,
          },
        });

        if (!user?.clientProfile) {
          return reply.status(404).send({
            message: "Nie znaleziono profilu klienta",
          });
        }

        const exercises = await getUserExerciseProgress(
          app,
          user.clientProfile.id
        );

        return {
          exercises,
        };
      } catch (error) {
        request.log.error(error);

        return reply.status(500).send({
          message: "Błąd serwera",
        });
      }
    }
  );

  app.get(
    "/api/training/workout/:id",
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number;
          role: "CLIENT" | "TRAINER";
        }>();

        if (decoded.role !== "CLIENT") {
          return reply.status(403).send({
            message: "Dostęp tylko dla klientów",
          });
        }

        const user = await app.prisma.user.findUnique({
          where: {
            id: decoded.userId,
          },
          include: {
            clientProfile: true,
          },
        });

        if (!user?.clientProfile) {
          return reply.status(404).send({
            message: "Nie znaleziono profilu klienta",
          });
        }

        const { id } = request.params as {
          id: string;
        };

        const workoutId = Number(id);

        if (!Number.isInteger(workoutId)) {
          return reply.status(400).send({
            message: "Nieprawidłowe ID treningu",
          });
        }

        const workout =
          await app.prisma.workout.findFirst({
            where: {
              id: workoutId,
              plan: {
                clientId: user.clientProfile.id,
              },
            },
            include: {
              exercises: {
                orderBy: {
                  order: "asc",
                },
                include: {
                  exercise: true,
                },
              },
            },
          });

        if (!workout) {
          return reply.status(404).send({
            message: "Nie znaleziono treningu",
          });
        }

        return workout;
      } catch (error) {
        request.log.error(error);

        return reply.status(500).send({
          message: "Błąd serwera",
        });
      }
    }
  );

  app.post(
    "/api/training/session/start",
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number;
          role: "CLIENT" | "TRAINER";
        }>();

        if (decoded.role !== "CLIENT") {
          return reply.status(403).send({
            message: "Dostęp tylko dla klientów",
          });
        }

        const user =
          await app.prisma.user.findUnique({
            where: {
              id: decoded.userId,
            },
            include: {
              clientProfile: true,
            },
          });

        if (!user?.clientProfile) {
          return reply.status(404).send({
            message: "Nie znaleziono profilu klienta",
          });
        }

        const body = request.body as {
          workoutId?: number;
        };

        const workoutId = Number(body?.workoutId);

        if (!Number.isInteger(workoutId)) {
          return reply.status(400).send({
            message: "workoutId jest wymagany",
          });
        }

        const workout =
          await app.prisma.workout.findFirst({
            where: {
              id: workoutId,
              plan: {
                clientId: user.clientProfile.id,
              },
            },
          });

        if (!workout) {
          return reply.status(404).send({
            message: "Nie znaleziono treningu",
          });
        }

        const activeSession =
          await app.prisma.workoutSession.findFirst({
            where: {
              clientId: user.clientProfile.id,
              workoutId,
              finishedAt: null,
            },
            orderBy: {
              startedAt: "desc",
            },
          });

        if (activeSession) {
          return {
            session: activeSession,
          };
        }

        const session =
          await app.prisma.workoutSession.create({
            data: {
              clientId: user.clientProfile.id,
              workoutId,
              startedAt: new Date(),
            },
          });

        return reply.status(201).send({
          session,
        });
      } catch (error) {
        request.log.error(error);

        return reply.status(500).send({
          message: "Błąd serwera",
        });
      }
    }
  );

  app.post(
    "/api/training/session/:id/set",
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number;
          role: "CLIENT" | "TRAINER";
        }>();

        if (decoded.role !== "CLIENT") {
          return reply.status(403).send({
            message: "Dostęp tylko dla klientów",
          });
        }

        const user =
          await app.prisma.user.findUnique({
            where: {
              id: decoded.userId,
            },
            include: {
              clientProfile: true,
            },
          });

        if (!user?.clientProfile) {
          return reply.status(404).send({
            message: "Nie znaleziono profilu klienta",
          });
        }

        const { id } = request.params as {
          id: string;
        };

        const sessionId = Number(id);

        if (!Number.isInteger(sessionId)) {
          return reply.status(400).send({
            message: "Nieprawidłowe ID sesji",
          });
        }

        const session =
          await app.prisma.workoutSession.findFirst({
            where: {
              id: sessionId,
              clientId: user.clientProfile.id,
            },
          });

        if (!session) {
          return reply.status(404).send({
            message: "Nie znaleziono sesji treningowej",
          });
        }

        if (session.finishedAt) {
          return reply.status(400).send({
            message: "Ten trening jest już zakończony",
          });
        }

        const body = request.body as {
          exerciseId?: number;
          setNumber?: number;
          weight?: number;
          reps?: number;
        };

        const exerciseId = Number(body?.exerciseId);
        const setNumber = Number(body?.setNumber);
        const weight = Number(body?.weight);
        const reps = Number(body?.reps);

        if (
          !Number.isInteger(exerciseId) ||
          !Number.isInteger(setNumber) ||
          !Number.isFinite(weight) ||
          !Number.isInteger(reps) ||
          setNumber < 1 ||
          weight < 0 ||
          reps < 1
        ) {
          return reply.status(400).send({
            message:
              "exerciseId, setNumber, weight i reps mają nieprawidłowe wartości",
          });
        }

        const exerciseInWorkout =
          await app.prisma.workoutExercise.findFirst({
            where: {
              workoutId: session.workoutId ?? -1,
              exerciseId,
            },
          });

        if (!exerciseInWorkout) {
          return reply.status(400).send({
            message:
              "To ćwiczenie nie należy do tego treningu",
          });
        }

        const existingSet =
          await app.prisma.exerciseSet.findFirst({
            where: {
              sessionId,
              exerciseId,
              setNumber,
            },
          });

        const set = existingSet
          ? await app.prisma.exerciseSet.update({
              where: {
                id: existingSet.id,
              },
              data: {
                weight,
                reps,
              },
            })
          : await app.prisma.exerciseSet.create({
              data: {
                sessionId,
                exerciseId,
                setNumber,
                weight,
                reps,
              },
            });

        return reply.status(existingSet ? 200 : 201).send({
          set,
        });
      } catch (error) {
        request.log.error(error);

        return reply.status(500).send({
          message: "Błąd serwera",
        });
      }
    }
  );

  app.patch(
    "/api/training/session/:id/end",
    async (request, reply) => {
      try {
        const decoded = await request.jwtVerify<{
          userId: number;
          role: "CLIENT" | "TRAINER";
        }>();

        if (decoded.role !== "CLIENT") {
          return reply.status(403).send({
            message: "Dostęp tylko dla klientów",
          });
        }

        const user =
          await app.prisma.user.findUnique({
            where: {
              id: decoded.userId,
            },
            include: {
              clientProfile: true,
            },
          });

        if (!user?.clientProfile) {
          return reply.status(404).send({
            message: "Nie znaleziono profilu klienta",
          });
        }

        const { id } = request.params as {
          id: string;
        };

        const sessionId = Number(id);

        if (!Number.isInteger(sessionId)) {
          return reply.status(400).send({
            message: "Nieprawidłowe ID sesji",
          });
        }

        const session =
          await app.prisma.workoutSession.findFirst({
            where: {
              id: sessionId,
              clientId: user.clientProfile.id,
            },
          });

        if (!session) {
          return reply.status(404).send({
            message: "Nie znaleziono sesji treningowej",
          });
        }

        if (session.finishedAt) {
          return reply.status(400).send({
            message: "Ten trening jest już zakończony",
          });
        }

        const updatedSession =
          await app.prisma.workoutSession.update({
            where: {
              id: session.id,
            },
            data: {
              finishedAt: new Date(),
            },
            include: {
              workout: true,
              sets: {
                orderBy: [
                  {
                    exerciseId: "asc",
                  },
                  {
                    setNumber: "asc",
                  },
                ],
                include: {
                  exercise: true,
                },
              },
            },
          });

        return {
          session: updatedSession,
        };
      } catch (error) {
        request.log.error(error);

        return reply.status(500).send({
          message: "Błąd serwera",
        });
      }
    }
  );
}
