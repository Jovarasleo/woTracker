import {
  Button,
  Card,
  ColorPicker,
  ColorSwatch,
  Group,
  Input,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExerciseCreator } from "../../components/ExerciseCreator";
import { TemplateExerciseList } from "../../components/TemplateExerciseList";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import { useGoBack } from "../../hooks/useGoBack";
import {
  useCustomExercises,
  type CustomExerciseDraft,
} from "../../hooks/useCustomExercises";
import {
  useWorkoutTemplateForm,
  WORKOUT_NAME_MAX_LENGTH,
  type WorkoutTemplateFormValues,
} from "../../hooks/useWorkoutTemplateForm";
import { db, exerciseKindOf } from "../../store/db";
import { INDICATOR_COLORS, randomIndicatorColor } from "../../utils/colors";

export const Route = createFileRoute("/workout/newTemplate")({
  component: NewWorkoutTemplate,
});

function NewWorkoutTemplate() {
  const goBack = useGoBack();
  const {
    register,
    onSubmit,
    errors,
    isSubmitting,
    nameRules,
    exerciseNameRules,
    exerciseFields,
    appendExercise,
    removeExercise,
  } = useWorkoutTemplateForm({ name: "", exercises: [] });
  const [indicatorColor, setIndicatorColor] = useState(randomIndicatorColor);
  const { customExercises, addCustomExercise } = useCustomExercises();
  const [pickerOpened, { open: openPicker, close: closePicker }] =
    useDisclosure(false);

  const handleSelectExercise = (exercise: LibraryExercise) => {
    appendExercise({ name: exercise.name, kind: exercise.kind });
    closePicker();
  };

  const handleCreateCustomExercise = async (draft: CustomExerciseDraft) => {
    await addCustomExercise(draft);
    appendExercise({ name: draft.name, kind: exerciseKindOf(draft) });
    closePicker();
  };

  /** Runs only with valid, trimmed values; see `useWorkoutTemplateForm`. */
  const saveTemplate = async ({
    name,
    exercises,
  }: WorkoutTemplateFormValues) => {
    await db.transaction(
      "rw",
      db.workoutTemplates,
      db.exerciseTemplates,
      async () => {
        const templateId = await db.workoutTemplates.add({
          name,
          createdAt: new Date().toISOString(),
          indicatorColor,
        });

        if (!templateId) {
          throw new Error("Failed to create template");
        }

        await db.exerciseTemplates.bulkAdd(
          exercises.map((exercise, index) => ({
            workoutTemplateId: templateId,
            name: exercise.name,
            kind: exercise.kind,
            order: index,
          })),
        );
      },
    );

    goBack();
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      component="form"
      noValidate
      onSubmit={onSubmit(saveTemplate)}
    >
      <Stack>
        <TextInput
          {...register("name", nameRules)}
          label="Workout Name"
          withAsterisk
          maxLength={WORKOUT_NAME_MAX_LENGTH}
          error={errors.name?.message}
        />

        <TemplateExerciseList
          fields={exerciseFields}
          register={register}
          nameRules={exerciseNameRules}
          errors={errors.exercises}
          minExercises={0}
          onRemove={removeExercise}
        />

        <Button
          variant="light"
          leftSection={<IconPlus size={18} />}
          onClick={openPicker}
        >
          Add Exercise
        </Button>

        <Modal
          centered
          size="lg"
          opened={pickerOpened}
          onClose={closePicker}
          title="Add exercise to this template"
        >
          <ExerciseCreator
            customExercises={customExercises}
            onSelectExercise={handleSelectExercise}
            onCreateCustomExercise={handleCreateCustomExercise}
          />
        </Modal>

        <Input.Wrapper
          label="Indicator Color"
          description="Shown as a colored tag for this workout"
        >
          <Group gap="sm" align="center" className="mt-1 mb-2">
            <ColorSwatch color={indicatorColor} size={28} />
            <Text size="sm" c="dimmed">
              {indicatorColor}
            </Text>
          </Group>
          <ColorPicker
            format="hex"
            value={indicatorColor}
            onChange={setIndicatorColor}
            swatches={[...INDICATOR_COLORS]}
            swatchesPerRow={6}
            fullWidth
            size="lg"
          />
        </Input.Wrapper>

        <Group justify="flex-end">
          <Button type="submit" loading={isSubmitting}>
            Save Template
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
