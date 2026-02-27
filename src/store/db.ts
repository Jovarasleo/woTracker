import { Dexie, type EntityTable } from "dexie";

export interface WorkoutTemplate {
  id: number;
  name: string;
  createdAt: string;
}

export interface WorkoutSession {
  id: number;
  name: string; // independent name
  date: string;
  notes?: string;
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

interface WorkoutDB extends Dexie {
  workoutTemplates: EntityTable<WorkoutTemplate, "id">;
  exerciseTemplates: EntityTable<ExerciseTemplate, "id">;
  workoutSessions: EntityTable<WorkoutSession, "id">;
  exerciseLogs: EntityTable<ExerciseLog, "id">;
  setLogs: EntityTable<SetLog, "id">;
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
