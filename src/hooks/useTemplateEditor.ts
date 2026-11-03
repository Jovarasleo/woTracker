import { useState } from "react";
import { db } from "../store/db";
import type { ExerciseTemplate, WorkoutTemplate } from "../store/db";

interface EditableExercise {
  /** Present for existing rows, absent for newly added ones. */
  id?: number;
  name: string;
}

/**
 * Editing state and persistence for a single workout template. Seed it with the
 * loaded template and its exercises (mount the consumer with a `key` tied to the
 * template id so the draft resets when a different template loads).
 */
export function useTemplateEditor(
  template: WorkoutTemplate,
  exercises: ExerciseTemplate[],
) {
  const [name, setName] = useState(template.name);
  const [indicatorColor, setIndicatorColor] = useState(template.indicatorColor);
  const [editableExercises, setEditableExercises] = useState<
    EditableExercise[]
  >(exercises.map((exercise) => ({ id: exercise.id, name: exercise.name })));

  const updateExercise = (index: number, value: string) => {
    setEditableExercises((current) =>
      current.map((exercise, i) =>
        i === index ? { ...exercise, name: value } : exercise,
      ),
    );
  };

  const removeExercise = (index: number) => {
    setEditableExercises((current) => current.filter((_, i) => i !== index));
  };

  const addExercise = (exerciseName: string) => {
    setEditableExercises((current) => [...current, { name: exerciseName }]);
  };

  const canSave = name.trim() !== "";

  const save = async () => {
    if (!canSave) {
      return;
    }

    const keptExercises = editableExercises.filter(
      (exercise) => exercise.name.trim() !== "",
    );
    const keptIds = new Set(
      keptExercises
        .map((exercise) => exercise.id)
        .filter((id): id is number => id != null),
    );
    const removedIds = exercises
      .map((exercise) => exercise.id)
      .filter((id) => !keptIds.has(id));

    await db.transaction(
      "rw",
      db.workoutTemplates,
      db.exerciseTemplates,
      async () => {
        await db.workoutTemplates.update(template.id, {
          name: name.trim(),
          indicatorColor,
        });

        if (removedIds.length) {
          await db.exerciseTemplates.bulkDelete(removedIds);
        }

        await Promise.all(
          keptExercises.map((exercise, index) =>
            exercise.id != null
              ? db.exerciseTemplates.update(exercise.id, {
                  name: exercise.name.trim(),
                  order: index,
                })
              : db.exerciseTemplates.add({
                  workoutTemplateId: template.id,
                  name: exercise.name.trim(),
                  order: index,
                }),
          ),
        );
      },
    );
  };

  return {
    name,
    setName,
    indicatorColor,
    setIndicatorColor,
    editableExercises,
    updateExercise,
    removeExercise,
    addExercise,
    canSave,
    save,
  };
}
