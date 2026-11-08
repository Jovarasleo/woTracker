import { useLiveQuery } from "dexie-react-hooks";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import { db, exerciseKindOf, type CustomExercise } from "../../store/db";

export type CustomExerciseDraft = Omit<CustomExercise, "id" | "createdAt">;

interface Options {
  /**
   * Called with a newly created custom exercise, so the caller can use it
   * right away (e.g. add it to the session or template being edited).
   */
  onCreated?: (
    exercise: Pick<LibraryExercise, "name" | "kind">,
  ) => void | Promise<void>;
}

export function useCustomExercises({ onCreated }: Options = {}) {
  const customExercises = useLiveQuery(
    () => db.customExercises.orderBy("name").toArray(),
    [],
  );

  const addCustomExercise = async (draft: CustomExerciseDraft) => {
    return await db.customExercises.add({
      ...draft,
      name: draft.name.trim(),
      createdAt: new Date().toISOString(),
    });
  };

  /** Saves a custom exercise to the library, then passes it to `onCreated`. */
  const handleCreateCustomExercise = async (draft: CustomExerciseDraft) => {
    await addCustomExercise(draft);
    await onCreated?.({
      name: draft.name.trim(),
      kind: exerciseKindOf(draft),
    });
  };

  return {
    customExercises,
    handleCreateCustomExercise,
  };
}
