import { useLiveQuery } from "dexie-react-hooks";
import type { FormEvent } from "react";
import {
  useFieldArray,
  useForm,
  type RegisterOptions,
  type SubmitHandler,
} from "react-hook-form";
import { db, type ExerciseKind } from "../../store/db";
import { t } from "../../i18n/translations";

export const WORKOUT_NAME_MAX_LENGTH = 50;

export interface TemplateExerciseValue {
  /** Id of the stored exercise template; absent for newly added ones. */
  templateExerciseId?: string;
  name: string;
  kind: ExerciseKind;
}

export interface WorkoutTemplateFormValues {
  name: string;
  exercises: TemplateExerciseValue[];
}

// A function, so the message reads `t` at render time (in the current
// language).
const exerciseNameRules = (): RegisterOptions<
  WorkoutTemplateFormValues,
  `exercises.${number}.name`
> => ({
  setValueAs: (value: string) => value.trim(),
  required: t.templateForm.errors.exerciseNameRequired,
});

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
  excludeTemplateId?: string,
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
          message: t.templateForm.errors.noExercises,
        });
      }
    };

  const otherNames = useLiveQuery(
    async () =>
      (await db.templates.toArray())
        .filter((template) => template.id !== excludeTemplateId)
        .map((template) => template.name.trim().toLowerCase()),
    [excludeTemplateId],
  );

  const nameRules: RegisterOptions<WorkoutTemplateFormValues, "name"> = {
    setValueAs: (value: string) => value.trim(),
    required: t.templateForm.errors.nameRequired,
    maxLength: {
      value: WORKOUT_NAME_MAX_LENGTH,
      message: t.templateForm.errors.nameTooLong(WORKOUT_NAME_MAX_LENGTH),
    },
    validate: {
      unique: (name) =>
        !otherNames?.includes(name.toLowerCase()) ||
        t.templateForm.errors.nameTaken,
    },
  };

  return {
    register,
    onSubmit,
    errors,
    isSubmitting,
    nameRules,
    exerciseNameRules: exerciseNameRules(),
    exerciseFields,
    appendExercise,
    removeExercise,
  };
}
