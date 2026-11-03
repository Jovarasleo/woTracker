import { useEffect, useState } from "react";
import {
  loadExerciseCatalog,
  type CatalogExercise,
} from "../data/exerciseCatalog";

// Returns the built-in exercise library, or `undefined` while it is loading.
export function useExerciseCatalog() {
  const [catalog, setCatalog] = useState<CatalogExercise[]>();

  useEffect(() => {
    let cancelled = false;

    loadExerciseCatalog().then((exercises) => {
      if (!cancelled) {
        setCatalog(exercises);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return catalog;
}
