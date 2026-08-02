import { db } from "../store/db";

export function useExercise() {
  const addExercise = async (exerciseName: string, sessionId: number) => {
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

  const deleteExercise = async (exerciseLogId: number) => {
    await db.setLogs.where("exerciseLogId").equals(exerciseLogId).delete();
    await db.exerciseLogs.delete(exerciseLogId);
  };

  return {
    addExercise,
    deleteExercise,
  };
}
