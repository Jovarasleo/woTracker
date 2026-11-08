import { useLiveQuery } from "dexie-react-hooks";
import { db, type CardioMetrics, type ExerciseLog } from "../../store/db";

export function useExerciseLogEditor(exercise: ExerciseLog) {
  const sets = useLiveQuery(
    () =>
      db.setLogs.where("exerciseLogId").equals(exercise.id).sortBy("setNumber"),
    // The id, not the object: the log object changes on every edit of its own
    // values (e.g. cardio), which would needlessly re-subscribe this query.
    [exercise.id],
  );

  const addSet = async () => {
    const existingSets = await db.setLogs
      .where("exerciseLogId")
      .equals(exercise.id)
      .sortBy("setNumber");
    const previousSet = existingSets.at(-1);

    const setId = await db.setLogs.add({
      exerciseLogId: exercise.id,
      weight: previousSet?.weight ?? 0,
      reps: previousSet?.reps ?? 0,
      setNumber: existingSets.length + 1,
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

  /** Saves one or more of a cardio exercise's values. */
  const updateCardio = async (changes: CardioMetrics) => {
    await db.exerciseLogs.update(exercise.id, changes);
  };

  return {
    sets,
    updateCardio,
    addSet,
    deleteSet,
    updateSetWeight,
    updateSetReps,
  };
}
