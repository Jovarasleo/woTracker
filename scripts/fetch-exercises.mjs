// Downloads the public-domain free-exercise-db dataset
// (https://github.com/yuhonas/free-exercise-db, Unlicense) and writes a trimmed
// copy of gym-relevant exercises to src/data/exercises.json.
//
// Usage: npm run exercises:fetch

import { writeFile } from "node:fs/promises";

const SOURCE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const OUTPUT_PATH = new URL("../src/data/exercises.json", import.meta.url);

// Stretching and foam-roll drills are left out to keep the list focused on
// exercises people log sets for.
const GYM_CATEGORIES = new Set([
  "strength",
  "powerlifting",
  "olympic weightlifting",
  "strongman",
  "plyometrics",
  "cardio",
]);

const response = await fetch(SOURCE_URL);
if (!response.ok) {
  throw new Error(`Failed to download exercises: ${response.status}`);
}

const source = await response.json();

const exercises = source
  .filter((exercise) => GYM_CATEGORIES.has(exercise.category))
  .map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    category: exercise.category,
    level: exercise.level,
    equipment: exercise.equipment ?? null,
    primaryMuscles: exercise.primaryMuscles ?? [],
    secondaryMuscles: exercise.secondaryMuscles ?? [],
    instructions: exercise.instructions ?? [],
    images: exercise.images ?? [],
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

await writeFile(OUTPUT_PATH, `${JSON.stringify(exercises, null, 2)}\n`);

console.log(`Saved ${exercises.length} exercises to ${OUTPUT_PATH.pathname}`);
