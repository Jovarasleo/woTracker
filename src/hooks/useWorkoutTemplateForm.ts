import { useLiveQuery } from "dexie-react-hooks";
import type { FormEvent } from "react";
import {
  useFieldArray,
  useForm,
  type RegisterOptions,
  type SubmitHandler,
} from "react-hook-form";
import { db, type ExerciseKind } from "../store/db";

export const WORKOUT_NAME_MAX_LENGTH = 50;

export interface TemplateExerciseValue {
  /** Id of the stored exercise template; absent for newly added ones. */
  templateExerciseId?: number;
  name: string;
  kind: ExerciseKind;
}

/** Values of the create and edit workout template forms. */
export interface WorkoutTemplateFormValues {
  name: string;
  exercises: TemplateExerciseValue[];
}

const NO_EXERCISES_MESSAGE = "Add at least one exercise";

const exerciseNameRules: RegisterOptions<
  WorkoutTemplateFormValues,
  `exercises.${number}.name`
> = {
  setValueAs: (value: string) => value.trim(),
  required: "Exercise name is required",
};

/**
 * react-hook-form setup shared by the create and edit template pages.
 * Validation (values are trimmed first):
 * - name: required, at most `WORKOUT_NAME_MAX_LENGTH` characters, unique
 *   (case-insensitive) among the other templates;
 * - exercises: at least one, each with a name.
 * Pass `excludeTemplateId` when editing, so a template doesn't clash with its
 * own name.
 */
export function useWorkoutTemplateForm(
  defaultValues: WorkoutTemplateFormValues,
  excludeTemplateId?: number,
) {
  const {
    control,
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<WorkoutTemplateFormValues>({ mode: "onTouched", defaultValues });

  // The "at least one exercise" rule is checked in `onSubmit` rather than via
  // useFieldArray `rules`: those are skipped in development, where StrictMode's
  // effect re-run marks the array unmounted and the React Compiler's memoized
  // rules never re-register it, so dev and production behaved differently.
  const {
    fields: exerciseFields,
    append,
    remove: removeExercise,
  } = useFieldArray({ control, name: "exercises" });

  const appendExercise = (exercise: TemplateExerciseValue) => {
    // The list-level "no exercises" error only exists while the list is empty.
    if (getValues("exercises").length === 0) {
      clearErrors("exercises");
    }

    append(exercise);
  };

  /**
   * Form submit handler: validates every field plus the exercise minimum (so
   * all errors show at once) and calls `onValid` with trimmed values only when
   * everything passes.
   */
  const onSubmit =
    (onValid: SubmitHandler<WorkoutTemplateFormValues>) =>
    async (event: FormEvent<HTMLFormElement>) => {
      const hasExercises = getValues("exercises").length > 0;

      await handleSubmit(async (values) => {
        if (hasExercises) {
          await onValid(values);
        }
      })(event);

      // After handleSubmit, which replaces the errors with its own results. Set
      // on the array itself: it is empty, so there are no item errors to lose.
      if (!hasExercises) {
        setError("exercises", {
          type: "required",
          message: NO_EXERCISES_MESSAGE,
        });
      }
    };

  const otherNames = useLiveQuery(
    async () =>
      (await db.workoutTemplates.toArray())
        .filter((template) => template.id !== excludeTemplateId)
        .map((template) => template.name.trim().toLowerCase()),
    [excludeTemplateId],
  );

  const nameRules: RegisterOptions<WorkoutTemplateFormValues, "name"> = {
    setValueAs: (value: string) => value.trim(),
    required: "Workout name is required",
    maxLength: {
      value: WORKOUT_NAME_MAX_LENGTH,
      message: `Keep it under ${WORKOUT_NAME_MAX_LENGTH} characters`,
    },
    validate: {
      unique: (name) =>
        !otherNames?.includes(name.toLowerCase()) ||
        "A workout with this name already exists",
    },
  };

  return {
    register,
    onSubmit,
    errors,
    isSubmitting,
    nameRules,
    exerciseNameRules,
    exerciseFields,
    appendExercise,
    removeExercise,
  };
}
