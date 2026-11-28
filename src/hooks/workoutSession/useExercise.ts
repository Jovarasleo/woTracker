import { type LibraryExercise } from "../../data/exerciseCatalog";
import { db, type ExerciseKind } from "../../store/db";
import { newId } from "../../utils/ids";
import { type UndoAction } from "../shared/useUndo";
import { t } from "../../i18n/translations";

interface NewExercise {
  name: string;
  kind: ExerciseKind;
  /** Set when the exercise comes from a workout template. */
  templateExerciseId?: string;
}

interface Options {
  sessionId?: string;
  onAdded?: () => void;
  onDeleted?: (action: UndoAction) => void;
}

export function useExercise({ sessionId, onAdded, onDeleted }: Options = {}) {
  /**
   * Adds an exercise to a session. Strength exercises start with one empty set;
   * cardio is logged on the exercise itself, so it gets none. Safe to call
   * inside an outer transaction that includes `sessionExercises` and `sessionSets`.
   */
  const addExercise = (exercise: NewExercise, sessionId: string) =>
    db.transaction("rw", db.sessionExercises, db.sessionSets, async () => {
      const existingCount = await db.sessionExercises
        .where("sessionId")
        .equals(sessionId)
        .count();

      const sessionExerciseId = await db.sessionExercises.add({
        id: newId(),
        sessionId,
        name: exercise.name,
        kind: exercise.kind,
        order: existingCount * 1000,
        templateExerciseId: exercise.templateExerciseId,
      });

      if (exercise.kind === "strength") {
        await db.sessionSets.add({
          id: newId(),
          sessionExerciseId,
          weight: 0,
          reps: 0,
          setNumber: 1,
        });
      }

      return sessionExerciseId;
    });

  /**
   * Removes an exercise and its sets together. Undo puts the same rows (same
   * ids, order and set numbers) back, so it reappears exactly where it was.
   */
  const deleteExercise = async (sessionExerciseId: string) => {
    const removed = await db.transaction(
      "rw",
      db.sessionExercises,
      db.sessionSets,
      async () => {
        const exerciseLog = await db.sessionExercises.get(sessionExerciseId);
        const sets = await db.sessionSets
          .where("sessionExerciseId")
          .equals(sessionExerciseId)
          .toArray();

        await db.sessionSets.bulkDelete(sets.map((set) => set.id));
        await db.sessionExercises.delete(sessionExerciseId);

        return exerciseLog && { exerciseLog, sets };
      },
    );

    if (!removed) {
      return;
    }

    onDeleted?.({
      message: t.session.exerciseRemoved(removed.exerciseLog.name),
      undo: () =>
        db.transaction("rw", db.sessionExercises, db.sessionSets, async () => {
          await db.sessionExercises.put(removed.exerciseLog);
          await db.sessionSets.bulkPut(removed.sets);
        }),
    });
  };

  const handleSelectExercise = async (
    exercise: Pick<LibraryExercise, "name" | "kind">,
  ) => {
    if (sessionId == null) {
      return;
    }

    await addExercise({ name: exercise.name, kind: exercise.kind }, sessionId);
    onAdded?.();
  };

  return {
    addExercise,
    deleteExercise,
    handleSelectExercise,
  };
}
