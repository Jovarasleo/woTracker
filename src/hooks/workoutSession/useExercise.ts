import { type LibraryExercise } from "../../data/exerciseCatalog";
import { db, type ExerciseKind } from "../../store/db";

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
}

export function useExercise({ sessionId, onAdded }: Options = {}) {
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

  /** Removes an exercise and its sets together. */
  const deleteExercise = (exerciseLogId: number) =>
    db.transaction("rw", db.exerciseLogs, db.setLogs, async () => {
      await db.setLogs.where("exerciseLogId").equals(exerciseLogId).delete();
      await db.exerciseLogs.delete(exerciseLogId);
    });

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
