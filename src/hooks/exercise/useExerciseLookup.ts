import {
  fromCatalogExercise,
  fromCustomExercise,
  type LibraryExercise,
} from "../../data/exerciseCatalog";
import { useCustomExercises } from "./useCustomExercises";
import { useExerciseCatalog } from "./useExerciseCatalog";

/**
 * Finds the library entry for an exercise by name. Sessions and templates only
 * store the name, so this is how they get back to its description and pictures.
 * Returns `undefined` for every name until the library has loaded.
 */
export function useExerciseLookup() {
  const catalog = useExerciseCatalog();
  const { customExercises } = useCustomExercises();

  // Custom exercises come last so they win over a catalog entry of the same name.
  const exerciseByName = new Map(
    [
      ...(catalog ?? []).map(fromCatalogExercise),
      ...(customExercises ?? []).map(fromCustomExercise),
    ].map((exercise) => [exercise.name.toLowerCase(), exercise]),
  );

  return (name: string): LibraryExercise | undefined =>
    exerciseByName.get(name.toLowerCase());
}
