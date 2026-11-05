// Built-in exercise library sourced from the public-domain free-exercise-db
// dataset (https://github.com/yuhonas/free-exercise-db). Regenerate
// exercises.json with `npm run exercises:fetch`.

import {
  exerciseKindOf,
  type CustomExercise,
  type ExerciseKind,
} from "../store/db";

export interface CatalogExercise {
  id: string;
  name: string;
  category: string;
  level: string;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[]; // paths relative to CATALOG_IMAGE_BASE_URL
}

// Common shape for catalog and user-created exercises, used by the picker UI.
export interface LibraryExercise {
  key: string;
  source: "catalog" | "custom";
  name: string;
  description?: string;
  instructions: string[];
  imageUrls: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string | null;
  level?: string;
  category?: string;
  kind: ExerciseKind;
}

const CATALOG_IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

let catalogPromise: Promise<CatalogExercise[]> | null = null;

// The catalog is large, so it is loaded lazily in its own chunk and cached.
export function loadExerciseCatalog() {
  catalogPromise ??= import("./exercises.json").then(
    (module) => module.default as CatalogExercise[],
    (error: unknown) => {
      // Don't cache a failed load, so the next call can retry.
      catalogPromise = null;
      throw error;
    },
  );

  return catalogPromise;
}

export function fromCatalogExercise(
  exercise: CatalogExercise,
): LibraryExercise {
  return {
    key: `catalog-${exercise.id}`,
    source: "catalog",
    name: exercise.name,
    instructions: exercise.instructions,
    imageUrls: exercise.images.map(
      (imagePath) => `${CATALOG_IMAGE_BASE_URL}${imagePath}`,
    ),
    primaryMuscles: exercise.primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
    equipment: exercise.equipment,
    level: exercise.level,
    category: exercise.category,
    kind: exercise.category === "cardio" ? "cardio" : "strength",
  };
}

export function fromCustomExercise(exercise: CustomExercise): LibraryExercise {
  return {
    key: `custom-${exercise.id}`,
    source: "custom",
    name: exercise.name,
    description: exercise.description,
    instructions: [],
    imageUrls: [],
    primaryMuscles: exercise.primaryMuscle ? [exercise.primaryMuscle] : [],
    secondaryMuscles: [],
    equipment: exercise.equipment ?? null,
    kind: exerciseKindOf(exercise),
  };
}

export function matchesExerciseQuery(exercise: LibraryExercise, query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = [
    exercise.name,
    exercise.equipment ?? "",
    ...exercise.primaryMuscles,
  ]
    .join(" ")
    .toLowerCase();

  return terms.every((term) => haystack.includes(term));
}
