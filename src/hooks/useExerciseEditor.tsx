import { useLiveQuery } from "dexie-react-hooks";
import { db, type ExerciseTemplate } from "../store/db";

export function useExerciseEdtior(
  exercise: ExerciseTemplate,
  sessionId: number,
) {
  const exerciseLog = useLiveQuery(
    () =>
      db.exerciseLogs
        .where({ sessionId, exerciseTemplateId: exercise.id! })
        .first(),
    [sessionId, exercise.id],
  );

  const sets = useLiveQuery(
    () =>
      exerciseLog
        ? db.setLogs
            .where("exerciseLogId")
            .equals(exerciseLog.id!)
            .sortBy("setNumber")
        : [],
    [exerciseLog?.id],
  );

  const addSet = async () => {
    if (!exerciseLog) {
      const id = await db.exerciseLogs.add({
        sessionId,
        exerciseTemplateId: exercise.id!,
      });

      await db.setLogs.add({
        exerciseLogId: id,
        weight: 0,
        reps: 0,
        setNumber: 1,
      });
    } else {
      const setNumber = (sets?.length ?? 0) + 1;
      await db.setLogs.add({
        exerciseLogId: exerciseLog.id!,
        weight: 0,
        reps: 0,
        setNumber,
      });
    }
  };

  const updateSetWeight = async (weight: number, setId: number) => {
    if (!weight || !setId) {
      return;
    }

    await db.setLogs.update(setId, { weight });
  };

  const updateSetReps = async (reps: number, setId: number) => {
    if (!reps || !setId) {
      return;
    }

    await db.setLogs.update(setId, { reps });
  };

  return {
    exerciseLog,
    sets,
    addSet,
    updateSetWeight,
    updateSetReps,
  };
}
