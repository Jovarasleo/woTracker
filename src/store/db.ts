import { Dexie, type EntityTable } from "dexie";

export interface WorkoutTemplate {
  id: number;
  name: string;
  createdAt: string;
}

export interface WorkoutSession {
  id: number;
  workoutTemplateId: number;
  date: string;
  notes?: string;
}

export interface ExerciseTemplate {
  id: number;
  workoutTemplateId: number;
  name: string;
  order: number;
}

export interface ExerciseLog {
  id: number;
  sessionId: number;
  exerciseTemplateId: number;
}

export interface SetLog {
  id: number;
  exerciseLogId: number;
  weight: number;
  reps: number;
  setNumber: number;
}

interface WorkoutDB extends Dexie {
  workoutTemplates: EntityTable<WorkoutTemplate, "id">;
  exerciseTemplates: EntityTable<ExerciseTemplate, "id">;
  workoutSessions: EntityTable<WorkoutSession, "id">;
  exerciseLogs: EntityTable<ExerciseLog, "id">;
  setLogs: EntityTable<SetLog, "id">;
}

export const db = new Dexie("WorkoutDB") as WorkoutDB;

db.version(2).stores({
  workoutTemplates: "++id, name, createdAt",

  // index templateId so we can fetch exercises per template
  exerciseTemplates: "++id, workoutTemplateId, order",

  // index templateId + date for history queries
  workoutSessions: "++id, workoutTemplateId, date",

  // index sessionId for fetching session exercises
  exerciseLogs:
    "++id, sessionId, exerciseTemplateId, [sessionId+exerciseTemplateId]",

  // index exerciseLogId for fetching sets
  setLogs: "++id, exerciseLogId, setNumber",
});
