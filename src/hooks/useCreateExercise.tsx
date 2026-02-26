import { db } from "../store/db";

export function useCreateExercise() {
  const addNewExerciseToSession = async (
    exerciseName: string,
    sessionId: number,
  ) => {
    const existing = await db.exerciseLogs
      .where("sessionId")
      .equals(sessionId)
      .sortBy("order");

    const nextOrder = existing.length * 1000;

    const exerciseLogId = await db.exerciseLogs.add({
      sessionId,
      name: exerciseName,
      order: nextOrder,
    });

    await db.setLogs.add({
      exerciseLogId,
      weight: 0,
      reps: 0,
      setNumber: 1,
    });

    return exerciseLogId;
  };

  return {
    addNewExerciseToSession,
  };
}
