import { Dexie, type EntityTable } from "dexie";
import { randomIndicatorColor } from "../utils/colors";

export interface WorkoutTemplate {
  id: number;
  name: string;
  createdAt: string;
  indicatorColor: string; // hex color used as the workout's visual indicator
}

export interface WorkoutSession {
  id: number;
  name: string; // independent name
  date: string;
  notes?: string;
  workoutTemplateId?: number; // template this session was created from (may dangle if template deleted)
  indicatorColor: string; // copied from the template at creation
}

export interface ExerciseTemplate {
  id: number;
  workoutTemplateId: number;
  name: string; // independent exercise library
  order?: number;
}

export interface ExerciseLog {
  id: number;
  sessionId: number; // links exercise to a session
  name: string;
  order?: number; // copied
  exerciseTemplateId?: number; // reference to exercise template
}

export interface SetLog {
  id: number;
  exerciseLogId: number;
  weight: number;
  reps: number;
  setNumber: number;
}

export interface CustomExercise {
  id: number;
  name: string;
  description?: string;
  primaryMuscle?: string;
  equipment?: string;
  createdAt: string;
}

/** Contents of an exported backup file (see useBackup). */
export interface BackupFile {
  app?: string;
  exportedAt: string;
  dbVersion: number; // Dexie schema version (db.verno) the data came from
  tables: Record<string, unknown[]>;
}

interface WorkoutDB extends Dexie {
  workoutTemplates: EntityTable<WorkoutTemplate, "id">;
  exerciseTemplates: EntityTable<ExerciseTemplate, "id">;
  workoutSessions: EntityTable<WorkoutSession, "id">;
  exerciseLogs: EntityTable<ExerciseLog, "id">;
  setLogs: EntityTable<SetLog, "id">;
  customExercises: EntityTable<CustomExercise, "id">;
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
      .table<WorkoutTemplate>("workoutTemplates")
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
      .table<WorkoutTemplate>("workoutTemplates")
      .toArray();
    const templateByName = new Map(templates.map((t) => [t.name, t]));

    await tx
      .table<WorkoutSession>("workoutSessions")
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
