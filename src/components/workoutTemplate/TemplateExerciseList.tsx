import {
  ActionIcon,
  Input,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type {
  FieldArrayWithId,
  FieldErrors,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import { CardioBadge } from "../exercise/CardioBadge";
import type { WorkoutTemplateFormValues } from "../../hooks/workoutTemplate/useWorkoutTemplateForm";

interface Props {
  fields: FieldArrayWithId<WorkoutTemplateFormValues, "exercises">[];
  register: UseFormRegister<WorkoutTemplateFormValues>;
  nameRules: RegisterOptions<
    WorkoutTemplateFormValues,
    `exercises.${number}.name`
  >;
  errors: FieldErrors<WorkoutTemplateFormValues>["exercises"];
  /** Remove buttons are disabled once the list is down to this many. */
  minExercises: number;
  onRemove: (index: number) => void;
}

/**
 * Editable exercise list of a workout template form: one name input per
 * exercise (tagged when cardio) with a remove button, plus the list-level
 * error (e.g. "Add at least one exercise").
 */
export function TemplateExerciseList({
  fields,
  register,
  nameRules,
  errors,
  minExercises,
  onRemove,
}: Props) {
  const canRemove = fields.length > minExercises;

  return (
    <Input.Wrapper
      label="Exercises"
      withAsterisk
      error={errors?.message ?? errors?.root?.message}
      classNames={{ label: "block text-left", error: "text-left" }}
    >
      <Stack gap="xs" mt={4} mb={errors?.message ? 4 : 0}>
        {fields.length === 0 && (
          <Text size="sm" c="dimmed" className="text-left">
            No exercises yet.
          </Text>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <TextInput
              {...register(`exercises.${index}.name`, nameRules)}
              className="grow"
              aria-label={`Exercise ${index + 1}`}
              placeholder={`Exercise ${index + 1}`}
              error={errors?.[index]?.name?.message}
              rightSection={<CardioBadge kind={field.kind} />}
              rightSectionWidth={field.kind === "cardio" ? 64 : undefined}
            />
            <Tooltip
              label="A workout needs at least one exercise"
              disabled={canRemove}
            >
              {/* Wrapper so the tooltip still works on a disabled button */}
              <span className="mt-1">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label="Remove exercise"
                  disabled={!canRemove}
                  onClick={() => onRemove(index)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </span>
            </Tooltip>
          </div>
        ))}
      </Stack>
    </Input.Wrapper>
  );
}
