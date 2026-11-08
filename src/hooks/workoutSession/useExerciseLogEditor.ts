import { useLiveQuery } from "dexie-react-hooks";
import { db, type CardioMetrics, type ExerciseLog } from "../../store/db";
import { type UndoAction } from "../shared/useUndo";

interface Options {
  /** Called after a set is deleted, with how to restore it. */
  onDeleted?: (action: UndoAction) => void;
}

export function useExerciseLogEditor(
  exercise: ExerciseLog,
  { onDeleted }: Options = {},
) {
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

  /** A strength exercise always keeps at least one set. */
  const canDeleteSet = (sets?.length ?? 0) > 1;

  /**
   * Deletes a set, unless it is the exercise's last one (remove the exercise
   * instead). Undo puts the same row (same id and number) back.
   */
  const deleteSet = async (setId: number) => {
    // Checked against the stored rows, in one transaction with the delete, so
    // quick repeated taps can't remove the last set either.
    const set = await db.transaction("rw", db.setLogs, async () => {
      const siblingCount = await db.setLogs
        .where("exerciseLogId")
        .equals(exercise.id)
        .count();

      if (siblingCount <= 1) {
        return undefined;
      }

      const target = await db.setLogs.get(setId);
      await db.setLogs.delete(setId);
      return target;
    });

    if (!set) {
      return;
    }

    // Position as shown in the list, which can differ from `setNumber` once
    // earlier sets were deleted.
    const position = (sets?.findIndex((s) => s.id === setId) ?? -1) + 1;

    onDeleted?.({
      message: position
        ? `${exercise.name} · set ${position} removed`
        : `${exercise.name} · set removed`,
      undo: () => db.setLogs.put(set),
    });
  };

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
    canDeleteSet,
    deleteSet,
    updateSetWeight,
    updateSetReps,
  };
}
