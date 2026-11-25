import { useLiveQuery } from "dexie-react-hooks";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import { db, exerciseKindOf, type CustomExercise } from "../../store/db";

export type CustomExerciseDraft = Omit<CustomExercise, "id" | "createdAt">;

interface Options {
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
