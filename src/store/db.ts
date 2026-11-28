import { Dexie, type Table } from "dexie";
import { randomIndicatorColor } from "../utils/colors";
import {
  remapLegacyTables,
  type LegacyCustomExercise,
  type LegacyExerciseLog,
  type LegacyExerciseTemplate,
  type LegacySetLog,
  type LegacyWorkoutSession,
  type LegacyWorkoutTemplate,
} from "./legacyMigration";

/**
 * How an exercise is logged: `strength` as sets of weight × reps, `cardio` as a
 * single duration and distance. Rows saved before this field existed have no
 * `kind` and are strength — read it through `exerciseKindOf`.
 */
export type ExerciseKind = "strength" | "cardio";

export function exerciseKindOf(exercise: { kind?: ExerciseKind }) {
  return exercise.kind ?? "strength";
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  createdAt: string;
  indicatorColor: string; // hex color used as the workout's visual indicator
}

export interface WorkoutSession {
  id: string;
  name: string; // independent name
  date: string;
  notes?: string;
  templateId?: string; // template this session was created from (may dangle if template deleted)
  indicatorColor: string; // copied from the template at creation
  finishedAt?: string; // unset on sessions logged before "Finish workout" existed
  pausedMinutes?: number; // time between finishing and resuming, left out of the duration
}

export interface TemplateExercise {
  id: string;
  templateId: string;
  name: string; // independent exercise library
  order: number;
  kind?: ExerciseKind; // copied into the session's exercise
}

export interface CardioMetrics {
  durationMinutes?: number;
  distanceKm?: number;
  calories?: number;
  avgHeartRate?: number; // beats per minute
  rpe?: number; // rate of perceived exertion, 1–10
}

/** Cardio exercises store their `CardioMetrics` on the exercise itself (no sets). */
export interface SessionExercise extends CardioMetrics {
  id: string;
  sessionId: string;
  name: string;
  order: number;
  templateExerciseId?: string;
  kind?: ExerciseKind;
}

export interface SessionSet {
  id: string;
  sessionExerciseId: string;
  weight: number;
  reps: number;
  setNumber: number;
}

export interface UserExercise {
  id: string;
  name: string;
  description?: string;
  primaryMuscle?: string;
  equipment?: string;
  kind?: ExerciseKind;
  createdAt: string;
}

export interface BackupFile {
  app?: string;
  exportedAt: string;
  dbVersion: number; // Dexie schema version (db.verno) the data came from
  tables: Record<string, unknown[]>;
}

interface WorkoutDB extends Dexie {
  templates: Table<WorkoutTemplate, string>;
  templateExercises: Table<TemplateExercise, string>;
  sessions: Table<WorkoutSession, string>;
  sessionExercises: Table<SessionExercise, string>;
  sessionSets: Table<SessionSet, string>;
  userExercises: Table<UserExercise, string>;
}

export const db = new Dexie("WorkoutDB") as WorkoutDB;

db.version(6).stores({
  workoutTemplates: "++id, name, createdAt",
  exerciseTemplates: "++id, workoutTemplateId, order",
  workoutSessions: "++id, name, date",
  exerciseLogs:
    "++id, sessionId, name, order, createdAt, exerciseTemplateId, [sessionId+exerciseTemplateId]",
  setLogs: "++id, exerciseLogId, setNumber",
});

// v7: add `indicatorColor` to workout templates and backfill existing rows
// (created before this field existed) with a random palette color.
db.version(7)
  .stores({
    workoutTemplates: "++id, name, createdAt",
    exerciseTemplates: "++id, workoutTemplateId, order",
    workoutSessions: "++id, name, date",
    exerciseLogs:
      "++id, sessionId, name, order, createdAt, exerciseTemplateId, [sessionId+exerciseTemplateId]",
    setLogs: "++id, exerciseLogId, setNumber",
  })
  .upgrade(async (tx) => {
    await tx
      .table<LegacyWorkoutTemplate>("workoutTemplates")
      .toCollection()
      .modify((template) => {
        if (!template.indicatorColor) {
          template.indicatorColor = randomIndicatorColor();
        }
      });
  });

// v8: link sessions to their source template (`workoutTemplateId`) and snapshot
// the template's `indicatorColor` onto the session. Existing sessions are
// backfilled by matching the (copied) session name to a template name.
db.version(8)
  .stores({
    workoutTemplates: "++id, name, createdAt",
    exerciseTemplates: "++id, workoutTemplateId, order",
    workoutSessions: "++id, name, date, workoutTemplateId",
    exerciseLogs:
      "++id, sessionId, name, order, createdAt, exerciseTemplateId, [sessionId+exerciseTemplateId]",
    setLogs: "++id, exerciseLogId, setNumber",
  })
  .upgrade(async (tx) => {
    const templates = await tx
      .table<LegacyWorkoutTemplate>("workoutTemplates")
      .toArray();
    const templateByName = new Map(templates.map((t) => [t.name, t]));

    await tx
      .table<LegacyWorkoutSession>("workoutSessions")
      .toCollection()
      .modify((session) => {
        const template = templateByName.get(session.name);
        if (session.workoutTemplateId == null && template) {
          session.workoutTemplateId = template.id;
        }

        if (!session.indicatorColor) {
          session.indicatorColor =
            template?.indicatorColor ?? randomIndicatorColor();
        }
      });
  });

// v9: add `customExercises`, user-created entries for the exercise library
// shown next to the built-in catalog.
db.version(9).stores({
  workoutTemplates: "++id, name, createdAt",
  exerciseTemplates: "++id, workoutTemplateId, order",
  workoutSessions: "++id, name, date, workoutTemplateId",
  exerciseLogs:
    "++id, sessionId, name, order, createdAt, exerciseTemplateId, [sessionId+exerciseTemplateId]",
  setLogs: "++id, exerciseLogId, setNumber",
  customExercises: "++id, name, createdAt",
});

// v10: string UUID primary keys, so rows created offline on different devices
// can't collide. Dexie can't change a primary key in place, so the rows are
// copied into new tables (with new ids and references) and v11 drops the old
// ones. Both run in the same upgrade transaction on the next open.
db.version(10)
  .stores({
    templates: "id, name, createdAt",
    templateExercises: "id, templateId, order",
    sessions: "id, name, date, templateId",
    sessionExercises:
      "id, sessionId, name, order, templateExerciseId, [sessionId+templateExerciseId]",
    sessionSets: "id, sessionExerciseId, setNumber",
    userExercises: "id, name, createdAt",
  })
  .upgrade(async (tx) => {
    const migrated = remapLegacyTables({
      workoutTemplates: await tx
        .table<LegacyWorkoutTemplate>("workoutTemplates")
        .toArray(),
      exerciseTemplates: await tx
        .table<LegacyExerciseTemplate>("exerciseTemplates")
        .toArray(),
      workoutSessions: await tx
        .table<LegacyWorkoutSession>("workoutSessions")
        .toArray(),
      exerciseLogs: await tx.table<LegacyExerciseLog>("exerciseLogs").toArray(),
      setLogs: await tx.table<LegacySetLog>("setLogs").toArray(),
      customExercises: await tx
        .table<LegacyCustomExercise>("customExercises")
        .toArray(),
    });

    for (const [name, rows] of Object.entries(migrated)) {
      await tx.table(name).bulkAdd(rows);
    }
  });

db.version(11).stores({
  workoutTemplates: null,
  exerciseTemplates: null,
  workoutSessions: null,
  exerciseLogs: null,
  setLogs: null,
  customExercises: null,
});

// Another tab or the installed app just upgraded the database and this
// connection was closed for it: reload to run the new code against it.
db.on("versionchange", () => {
  location.reload();
});
