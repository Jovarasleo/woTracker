import { db } from "../store/db";

/**
 * Development-only data tooling.
 *
 * `seedDevData` populates IndexedDB with 7 workout templates and a year of
 * completed sessions; `clearAllData` wipes every table. These helpers are only
 * reachable from the dev-only `DevTools` UI (gated behind `import.meta.env.DEV`)
 * and are dynamically imported so they stay out of production bundles.
 */

interface SeedExercise {
  name: string;
  /** Starting working weight in kg (0 = bodyweight / added-weight movement). */
  baseWeight: number;
  /** Approximate weight gained across the full year of progression (kg). */
  gain: number;
  /** Inclusive [min, max] rep range worked per set. */
  repRange: [number, number];
}

interface SeedWorkout {
  name: string;
  exercises: SeedExercise[];
}

const WORKOUTS: SeedWorkout[] = [
  {
    name: "Push Day",
    exercises: [
      { name: "Bench Press", baseWeight: 60, gain: 20, repRange: [5, 8] },
      { name: "Overhead Press", baseWeight: 35, gain: 12, repRange: [5, 8] },
      {
        name: "Incline Dumbbell Press",
        baseWeight: 22,
        gain: 8,
        repRange: [8, 12],
      },
      { name: "Tricep Pushdown", baseWeight: 25, gain: 15, repRange: [10, 15] },
      { name: "Lateral Raise", baseWeight: 8, gain: 6, repRange: [12, 15] },
    ],
  },
  {
    name: "Pull Day",
    exercises: [
      { name: "Deadlift", baseWeight: 90, gain: 35, repRange: [3, 6] },
      { name: "Barbell Row", baseWeight: 55, gain: 15, repRange: [6, 10] },
      { name: "Lat Pulldown", baseWeight: 45, gain: 20, repRange: [8, 12] },
      { name: "Face Pull", baseWeight: 20, gain: 10, repRange: [12, 15] },
      { name: "Barbell Curl", baseWeight: 25, gain: 10, repRange: [8, 12] },
    ],
  },
  {
    name: "Leg Day",
    exercises: [
      { name: "Back Squat", baseWeight: 80, gain: 30, repRange: [4, 8] },
      { name: "Romanian Deadlift", baseWeight: 60, gain: 20, repRange: [6, 10] },
      { name: "Leg Press", baseWeight: 120, gain: 60, repRange: [8, 12] },
      { name: "Leg Curl", baseWeight: 35, gain: 15, repRange: [10, 12] },
      {
        name: "Standing Calf Raise",
        baseWeight: 50,
        gain: 25,
        repRange: [12, 15],
      },
    ],
  },
  {
    name: "Upper Body",
    exercises: [
      { name: "Pull-Up", baseWeight: 0, gain: 15, repRange: [6, 10] },
      { name: "Flat Bench Press", baseWeight: 60, gain: 20, repRange: [5, 8] },
      { name: "Seated Cable Row", baseWeight: 50, gain: 20, repRange: [8, 12] },
      {
        name: "Dumbbell Shoulder Press",
        baseWeight: 18,
        gain: 8,
        repRange: [8, 12],
      },
    ],
  },
  {
    name: "Lower Body",
    exercises: [
      { name: "Front Squat", baseWeight: 50, gain: 20, repRange: [5, 8] },
      { name: "Hip Thrust", baseWeight: 80, gain: 40, repRange: [8, 12] },
      { name: "Walking Lunge", baseWeight: 20, gain: 10, repRange: [10, 12] },
      { name: "Leg Extension", baseWeight: 40, gain: 20, repRange: [10, 15] },
    ],
  },
  {
    name: "Full Body",
    exercises: [
      { name: "Deadlift", baseWeight: 90, gain: 35, repRange: [3, 6] },
      { name: "Overhead Press", baseWeight: 35, gain: 12, repRange: [5, 8] },
      { name: "Pull-Up", baseWeight: 0, gain: 15, repRange: [6, 10] },
    ],
  },
  {
    name: "Chest & Back",
    exercises: [
      {
        name: "Incline Bench Press",
        baseWeight: 50,
        gain: 18,
        repRange: [5, 8],
      },
      { name: "Weighted Dip", baseWeight: 0, gain: 20, repRange: [6, 10] },
      { name: "Pendlay Row", baseWeight: 55, gain: 15, repRange: [5, 8] },
      { name: "Lat Pulldown", baseWeight: 45, gain: 20, repRange: [8, 12] },
      { name: "Cable Fly", baseWeight: 15, gain: 8, repRange: [12, 15] },
    ],
  },
];

/** Deterministic PRNG (mulberry32) so re-seeding yields consistent data. */
function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random integer in [min, max] inclusive. */
function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

interface GeneratedSession {
  date: Date;
  /** Progression factor in [0, 1] across the generated time span. */
  progress: number;
}

/**
 * Builds session dates across the past year: a session every 2-3 days, with a
 * 1-2 week deload gap inserted every 2-3 months.
 */
function generateSessionDates(rng: () => number): GeneratedSession[] {
  const today = new Date();
  const start = new Date(today);
  start.setFullYear(start.getFullYear() - 1);

  const spanMs = today.getTime() - start.getTime();
  const sessions: GeneratedSession[] = [];

  const cursor = new Date(start);
  let nextGap = new Date(cursor);
  nextGap.setDate(nextGap.getDate() + randInt(rng, 60, 90));

  while (cursor <= today) {
    // Give each session a realistic time of day.
    const dated = new Date(cursor);
    dated.setHours(randInt(rng, 7, 20), randInt(rng, 0, 59), 0, 0);

    sessions.push({
      date: dated,
      progress: (dated.getTime() - start.getTime()) / spanMs,
    });

    cursor.setDate(cursor.getDate() + randInt(rng, 2, 3));

    if (cursor >= nextGap) {
      cursor.setDate(cursor.getDate() + randInt(rng, 7, 14));
      nextGap = new Date(cursor);
      nextGap.setDate(nextGap.getDate() + randInt(rng, 60, 90));
    }
  }

  return sessions;
}

function computeWeight(
  exercise: SeedExercise,
  progress: number,
  rng: () => number,
): number {
  const target = exercise.baseWeight + exercise.gain * progress;
  const noise = (rng() - 0.5) * exercise.gain * 0.1;
  return roundToStep(Math.max(0, target + noise), 2.5);
}

export interface SeedSummary {
  workouts: number;
  sessions: number;
  sets: number;
}

/**
 * Populates the database with workout templates and a year of completed
 * sessions. Safe to run repeatedly — call `clearAllData` first if you want a
 * clean slate.
 */
export async function seedDevData(): Promise<SeedSummary> {
  const rng = createRng(20260101);
  const sessionPlan = generateSessionDates(rng);
  let setCount = 0;

  await db.transaction(
    "rw",
    [
      db.workoutTemplates,
      db.exerciseTemplates,
      db.workoutSessions,
      db.exerciseLogs,
      db.setLogs,
    ],
    async () => {
      const createdAt = new Date();
      createdAt.setFullYear(createdAt.getFullYear() - 1);

      const templates = await Promise.all(
        WORKOUTS.map(async (workout) => {
          const templateId = await db.workoutTemplates.add({
            name: workout.name,
            createdAt: createdAt.toISOString(),
          });

          const exerciseTemplateIds = await Promise.all(
            workout.exercises.map((exercise, index) =>
              db.exerciseTemplates.add({
                workoutTemplateId: templateId,
                name: exercise.name,
                order: index * 1000,
              }),
            ),
          );

          return { workout, exerciseTemplateIds };
        }),
      );

      for (let s = 0; s < sessionPlan.length; s++) {
        const plan = sessionPlan[s];
        const { workout, exerciseTemplateIds } = templates[s % templates.length];

        const sessionId = await db.workoutSessions.add({
          name: workout.name,
          date: plan.date.toISOString(),
        });

        for (let e = 0; e < workout.exercises.length; e++) {
          const exercise = workout.exercises[e];
          const exerciseLogId = await db.exerciseLogs.add({
            sessionId,
            name: exercise.name,
            order: e * 1000,
            exerciseTemplateId: exerciseTemplateIds[e],
          });

          const sets = randInt(rng, 2, 3);
          const weight = computeWeight(exercise, plan.progress, rng);

          for (let setNumber = 1; setNumber <= sets; setNumber++) {
            await db.setLogs.add({
              exerciseLogId,
              weight,
              reps: randInt(rng, exercise.repRange[0], exercise.repRange[1]),
              setNumber,
            });
            setCount++;
          }
        }
      }
    },
  );

  return {
    workouts: WORKOUTS.length,
    sessions: sessionPlan.length,
    sets: setCount,
  };
}

/** Removes every record from all tables. */
export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.workoutTemplates,
      db.exerciseTemplates,
      db.workoutSessions,
      db.exerciseLogs,
      db.setLogs,
    ],
    async () => {
      await Promise.all([
        db.workoutTemplates.clear(),
        db.exerciseTemplates.clear(),
        db.workoutSessions.clear(),
        db.exerciseLogs.clear(),
        db.setLogs.clear(),
      ]);
    },
  );
}
