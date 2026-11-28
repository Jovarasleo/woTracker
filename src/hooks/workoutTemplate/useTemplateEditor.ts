import { useState } from "react";
import { db } from "../../store/db";
import { newId } from "../../utils/ids";
import type { TemplateExercise, WorkoutTemplate } from "../../store/db";
import type { WorkoutTemplateFormValues } from "./useWorkoutTemplateForm";

/**
 * Color state and persistence for editing a workout template; the name and
 * exercises live in the page's form (see `useWorkoutTemplateForm`). Mount the
 * consumer with a `key` tied to the template id so the draft resets when a
 * different template loads.
 */
export function useTemplateEditor(
  template: WorkoutTemplate,
  exercises: TemplateExercise[],
) {
  const [indicatorColor, setIndicatorColor] = useState(template.indicatorColor);

  const save = async (values: WorkoutTemplateFormValues) => {
    const keptIds = new Set(
      values.exercises.flatMap((exercise) =>
        exercise.templateExerciseId == null
          ? []
          : [exercise.templateExerciseId],
      ),
    );
    const removedIds = exercises
      .map((exercise) => exercise.id)
      .filter((id) => !keptIds.has(id));

    await db.transaction(
      "rw",
      db.templates,
      db.templateExercises,
      async () => {
        await db.templates.update(template.id, {
          name: values.name,
          indicatorColor,
        });

        if (removedIds.length) {
          await db.templateExercises.bulkDelete(removedIds);
        }

        await Promise.all(
          values.exercises.map((exercise, index) =>
            exercise.templateExerciseId != null
              ? db.templateExercises.update(exercise.templateExerciseId, {
                  name: exercise.name,
                  order: index,
                })
              : db.templateExercises.add({
                  id: newId(),
                  templateId: template.id,
                  name: exercise.name,
                  kind: exercise.kind,
                  order: index,
                }),
          ),
        );
      },
    );
  };

  return { indicatorColor, setIndicatorColor, save };
}
