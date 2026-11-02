import { useLiveQuery } from "dexie-react-hooks";
import { db, type ExerciseLog } from "../store/db";

export function useExerciseLogEditor(exercise: ExerciseLog) {
  const sets = useLiveQuery(
    () =>
      db.setLogs.where("exerciseLogId").equals(exercise.id).sortBy("setNumber"),
    [exercise],
  );

  const addSet = async () => {
    const setNumber = (sets?.length ?? 0) + 1;
    const setId = await db.setLogs.add({
      exerciseLogId: exercise.id,
      weight: 0,
      reps: 0,
      setNumber,
    });

    return setId;
  };

  const deleteSet = async (setId: number) => await db.setLogs.delete(setId);

  const updateSetWeight = async (weight: number, setId: number) => {
    if (weight == null || !setId) {
      return;
    }

    await db.setLogs.update(setId, { weight });
  };

  const updateSetReps = async (reps: number, setId: number) => {
    if (reps == null || !setId) {
      return;
    }

    await db.setLogs.update(setId, { reps });
  };

  return {
    sets,
    addSet,
    deleteSet,
    updateSetWeight,
    updateSetReps,
  };
}
