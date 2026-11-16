import { Button, Stack, Text, TextInput } from "@mantine/core";
import {
  useWorkoutTemplateForm,
  WORKOUT_NAME_MAX_LENGTH,
  type TemplateExerciseValue,
} from "../../hooks/workoutTemplate/useWorkoutTemplateForm";
import { t } from "../../i18n/translations";

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

  return (
    <form noValidate onSubmit={onSubmit(({ name }) => onSave(name))}>
      <Stack>
        <Text size="sm">
          {t.session.saveAsTemplateText(
            t.common.exerciseCount(exercises.length),
          )}
        </Text>
        <TextInput
          {...register("name", nameRules)}
          label={t.common.workoutName}
          withAsterisk
          maxLength={WORKOUT_NAME_MAX_LENGTH}
          error={errors.name?.message}
          data-autofocus
        />
        <div className="flex justify-end gap-3">
          <Button variant="default" onClick={onCancel} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {t.common.save}
          </Button>
        </div>
      </Stack>
    </form>
  );
}
