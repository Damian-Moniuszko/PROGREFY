import type { FastifyInstance } from "fastify";

export async function getUserTrainingPlans(
  app: FastifyInstance,
  clientId: number
) {
  return app.prisma.workoutPlan.findMany({
    where: {
      clientId,
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
}

export async function getUserWorkoutHistory(
  app: FastifyInstance,
  clientId: number
) {
  return app.prisma.workoutSession.findMany({
    where: {
      clientId,
      finishedAt: {
        not: null,
      },
    },
    orderBy: {
      startedAt: "desc",
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
}


export async function getUserExerciseProgress(
  app: FastifyInstance,
  clientId: number
) {
  const sessions = await app.prisma.workoutSession.findMany({
    where: {
      clientId,
      finishedAt: {
        not: null,
      },
    },
    orderBy: {
      startedAt: "asc",
    },
    include: {
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

  const byExercise = new Map<
    number,
    {
      exerciseId: number;
      name: string;
      muscleGroup: string | null;
      sessions: Array<{
        sessionId: number;
        startedAt: Date;
        bestWeight: number;
        totalVolume: number;
        sets: number;
      }>;
    }
  >();

  for (const session of sessions) {
    const grouped = new Map<number, typeof session.sets>();

    for (const set of session.sets) {
      const current = grouped.get(set.exerciseId) ?? [];
      current.push(set);
      grouped.set(set.exerciseId, current);
    }

    for (const [exerciseId, sets] of grouped) {
      const exercise = sets[0]?.exercise;

      if (!exercise) {
        continue;
      }

      const bestWeight = Math.max(
        ...sets.map((set) => set.weight)
      );

      const totalVolume = sets.reduce(
        (sum, set) => sum + set.weight * set.reps,
        0
      );

      const entry = byExercise.get(exerciseId) ?? {
        exerciseId,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        sessions: [],
      };

      entry.sessions.push({
        sessionId: session.id,
        startedAt: session.startedAt,
        bestWeight,
        totalVolume,
        sets: sets.length,
      });

      byExercise.set(exerciseId, entry);
    }
  }

  return Array.from(byExercise.values())
    .map((exercise) => {
      const latest =
        exercise.sessions[exercise.sessions.length - 1] ?? null;

      const previous =
        exercise.sessions.length > 1
          ? exercise.sessions[exercise.sessions.length - 2]
          : null;

      const bestWeight = Math.max(
        ...exercise.sessions.map(
          (session) => session.bestWeight
        )
      );

      return {
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        latest,
        previous,
        bestWeight,
        history: exercise.sessions,
      };
    })
    .sort((a, b) =>
      a.name.localeCompare(b.name, "pl")
    );
}
