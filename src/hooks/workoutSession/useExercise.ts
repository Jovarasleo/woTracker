import { type LibraryExercise } from "../../data/exerciseCatalog";
import { db, type ExerciseKind } from "../../store/db";
import { type UndoAction } from "../shared/useUndo";

interface NewExercise {
  name: string;
  kind: ExerciseKind;
  /** Set when the exercise comes from a workout template. */
  exerciseTemplateId?: number;
}

interface Options {
  /** Session that `handleSelectExercise` adds exercises to. */
  sessionId?: number;
  /** Called after `handleSelectExercise` has added an exercise. */
  onAdded?: () => void;
  /** Called after `deleteExercise`, with how to restore the exercise. */
  onDeleted?: (action: UndoAction) => void;
}

export function useExercise({ sessionId, onAdded, onDeleted }: Options = {}) {
  /**
   * Adds an exercise to a session. Strength exercises start with one empty set;
   * cardio is logged on the exercise itself, so it gets none. Safe to call
   * inside an outer transaction that includes `exerciseLogs` and `setLogs`.
   */
  const addExercise = (exercise: NewExercise, sessionId: number) =>
    db.transaction("rw", db.exerciseLogs, db.setLogs, async () => {
      const existingCount = await db.exerciseLogs
        .where("sessionId")
        .equals(sessionId)
        .count();

      const exerciseLogId = await db.exerciseLogs.add({
        sessionId,
        name: exercise.name,
        kind: exercise.kind,
        order: existingCount * 1000,
        exerciseTemplateId: exercise.exerciseTemplateId,
      });

      if (exercise.kind === "strength") {
        await db.setLogs.add({
          exerciseLogId,
          weight: 0,
          reps: 0,
          setNumber: 1,
        });
      }

      return exerciseLogId;
    });

  /**
   * Removes an exercise and its sets together. Undo puts the same rows (same
   * ids, order and set numbers) back, so it reappears exactly where it was.
   */
  const deleteExercise = async (exerciseLogId: number) => {
    const removed = await db.transaction(
      "rw",
      db.exerciseLogs,
      db.setLogs,
      async () => {
        const exerciseLog = await db.exerciseLogs.get(exerciseLogId);
        const sets = await db.setLogs
          .where("exerciseLogId")
          .equals(exerciseLogId)
          .toArray();

        await db.setLogs.bulkDelete(sets.map((set) => set.id));
        await db.exerciseLogs.delete(exerciseLogId);

        return exerciseLog && { exerciseLog, sets };
      },
    );

    if (!removed) {
      return;
    }

    onDeleted?.({
      message: `${removed.exerciseLog.name} removed`,
      undo: () =>
        db.transaction("rw", db.exerciseLogs, db.setLogs, async () => {
          await db.exerciseLogs.put(removed.exerciseLog);
          await db.setLogs.bulkPut(removed.sets);
        }),
    });
  };

  /** Adds an exercise picked from the library to `sessionId`. */
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
