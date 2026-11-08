import { Button, Stack, Text, TextInput } from "@mantine/core";
import {
  useWorkoutTemplateForm,
  WORKOUT_NAME_MAX_LENGTH,
  type TemplateExerciseValue,
} from "../../hooks/workoutTemplate/useWorkoutTemplateForm";

interface Props {
  defaultName: string;
  /** The session's exercises, which become the template's. */
  exercises: TemplateExerciseValue[];
  onCancel: () => void;
  /** Called with a valid, trimmed, unique name. */
  onSave: (name: string) => Promise<void>;
}

/** Asks for the name of a template made from a session. */
export function SaveAsTemplateForm({
  defaultName,
  exercises,
  onCancel,
  onSave,
}: Props) {
  // Same name rules as the template pages (required, length, unique).
  const { register, onSubmit, errors, isSubmitting, nameRules } =
    useWorkoutTemplateForm({ name: defaultName, exercises });

  const exerciseCount = `${exercises.length} ${
    exercises.length === 1 ? "exercise" : "exercises"
  }`;

  return (
    <form noValidate onSubmit={onSubmit(({ name }) => onSave(name))}>
      <Stack>
        <Text size="sm">
          Saves this session's {exerciseCount} as a workout you can start again.
        </Text>
        <TextInput
          {...register("name", nameRules)}
          label="Workout name"
          withAsterisk
          maxLength={WORKOUT_NAME_MAX_LENGTH}
          error={errors.name?.message}
          data-autofocus
        />
        <div className="flex justify-end gap-3">
          <Button variant="default" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save
          </Button>
        </div>
      </Stack>
    </form>
  );
}
