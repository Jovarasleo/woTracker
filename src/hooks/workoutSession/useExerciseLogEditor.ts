import { useLiveQuery } from "dexie-react-hooks";
import { db, type CardioMetrics, type SessionExercise } from "../../store/db";
import { newId } from "../../utils/ids";
import { type UndoAction } from "../shared/useUndo";
import { t } from "../../i18n/translations";

interface Options {
  onDeleted?: (action: UndoAction) => void;
}

export function useExerciseLogEditor(
  exercise: SessionExercise,
  { onDeleted }: Options = {},
) {
  const sets = useLiveQuery(
    () =>
      db.sessionSets.where("sessionExerciseId").equals(exercise.id).sortBy("setNumber"),
    // The id, not the object: the log object changes on every edit of its own
    // values (e.g. cardio), which would needlessly re-subscribe this query.
    [exercise.id],
  );

  const addSet = async () => {
    const existingSets = await db.sessionSets
      .where("sessionExerciseId")
      .equals(exercise.id)
      .sortBy("setNumber");
    const previousSet = existingSets.at(-1);

    const setId = await db.sessionSets.add({
      id: newId(),
      sessionExerciseId: exercise.id,
      weight: previousSet?.weight ?? 0,
      reps: previousSet?.reps ?? 0,
      setNumber: existingSets.length + 1,
    });

    return setId;
  };

  const canDeleteSet = (sets?.length ?? 0) > 1;

  const deleteSet = async (setId: string) => {
    // Checked against the stored rows, in one transaction with the delete, so
    // quick repeated taps can't remove the last set either.
    const set = await db.transaction("rw", db.sessionSets, async () => {
      const siblingCount = await db.sessionSets
        .where("sessionExerciseId")
        .equals(exercise.id)
        .count();

      if (siblingCount <= 1) {
        return undefined;
      }

      const target = await db.sessionSets.get(setId);
      await db.sessionSets.delete(setId);
      return target;
    });

    if (!set) {
      return;
    }

    // Position as shown in the list, which can differ from `setNumber` once
    // earlier sets were deleted.
    const position = (sets?.findIndex((s) => s.id === setId) ?? -1) + 1;

    onDeleted?.({
      message: t.session.setRemoved(exercise.name, position),
      undo: () => db.sessionSets.put(set),
    });
  };

  const updateSetWeight = async (weight: number, setId: string) => {
    if (weight == null || !setId) {
      return;
    }

    await db.sessionSets.update(setId, { weight });
  };

  const updateSetReps = async (reps: number, setId: string) => {
    if (reps == null || !setId) {
      return;
    }

    await db.sessionSets.update(setId, { reps });
  };

  const updateCardio = async (changes: CardioMetrics) => {
    await db.sessionExercises.update(exercise.id, changes);
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
