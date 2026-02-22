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
  order?: number; // optional, for sorting if needed
}

export interface ExerciseLog {
  id: number;
  sessionId: number; // links exercise to a session
  exerciseTemplateId: number; // reference to exercise template
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

db.version(3)
  .stores({
    workoutTemplates: "++id, name, createdAt",
    exerciseTemplates: "++id, workoutTemplateId, order",
    workoutSessions: "++id, name, date", // updated schema
    exerciseLogs:
      "++id, sessionId, exerciseTemplateId, [sessionId+exerciseTemplateId]",
    setLogs: "++id, exerciseLogId, setNumber",
  })
  .upgrade(async (tx) => {
    // Fetch all existing workout sessions
    const sessions = await tx.table("workoutSessions").toArray();

    console.log("onUpgrade");

    for (const session of sessions) {
      // For old sessions, copy the template name into session.name
      if ("workoutTemplateId" in session) {
        const template = await tx
          .table("workoutTemplates")
          .get(session.workoutTemplateId);
        // fallback name if template was deleted
        session.name = template?.name ?? "Untitled Session";
        // remove the old workoutTemplateId field
        delete session.workoutTemplateId;

        // update the session in the database
        await tx.table("workoutSessions").put(session);
      }
    }
  });
