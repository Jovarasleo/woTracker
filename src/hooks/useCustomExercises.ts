import { useLiveQuery } from "dexie-react-hooks";
import { db, type CustomExercise } from "../store/db";

export type CustomExerciseDraft = Omit<CustomExercise, "id" | "createdAt">;

export function useCustomExercises() {
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

  return {
    customExercises,
    addCustomExercise,
  };
}
