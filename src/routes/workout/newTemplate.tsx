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
import { ExerciseCreator } from "../../components/exercise/ExerciseCreator";
import { PageLayout } from "../../components/shared/PageLayout";
import { TemplateExerciseList } from "../../components/workoutTemplate/TemplateExerciseList";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import { useGoBack } from "../../hooks/shared/useGoBack";
import { useCustomExercises } from "../../hooks/exercise/useCustomExercises";
import {
  useWorkoutTemplateForm,
  WORKOUT_NAME_MAX_LENGTH,
  type WorkoutTemplateFormValues,
} from "../../hooks/workoutTemplate/useWorkoutTemplateForm";
import { db } from "../../store/db";
import { newId } from "../../utils/ids";
import { INDICATOR_COLORS, randomIndicatorColor } from "../../utils/colors";
import { t } from "../../i18n/translations";

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
  const [pickerOpened, { open: openPicker, close: closePicker }] =
    useDisclosure(false);

  const handleSelectExercise = (
    exercise: Pick<LibraryExercise, "name" | "kind">,
  ) => {
    appendExercise({ name: exercise.name, kind: exercise.kind });
    closePicker();
  };

  const { customExercises, handleCreateCustomExercise } = useCustomExercises({
    onCreated: handleSelectExercise,
  });

  /** Runs only with valid, trimmed values; see `useWorkoutTemplateForm`. */
  const saveTemplate = async ({
    name,
    exercises,
  }: WorkoutTemplateFormValues) => {
    await db.transaction(
      "rw",
      db.templates,
      db.templateExercises,
      async () => {
        const templateId = await db.templates.add({
          id: newId(),
          name,
          createdAt: new Date().toISOString(),
          indicatorColor,
        });
        await db.templateExercises.bulkAdd(
          exercises.map((exercise, index) => ({
            id: newId(),
            templateId,
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
    <PageLayout title={t.templateForm.newTitle}>
      <Card component="form" noValidate onSubmit={onSubmit(saveTemplate)}>
        <Stack>
          <TextInput
            {...register("name", nameRules)}
            label={t.common.workoutName}
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
            {t.common.addExercise}
          </Button>

          <Modal
            centered
            size="lg"
            opened={pickerOpened}
            onClose={closePicker}
            title={t.templateForm.addExerciseTitle}
          >
            <ExerciseCreator
              customExercises={customExercises}
              onSelectExercise={handleSelectExercise}
              onCreateCustomExercise={handleCreateCustomExercise}
            />
          </Modal>

          <Input.Wrapper
            label={t.templateForm.indicatorColor}
            description={t.templateForm.indicatorColorDescription}
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
            <Button variant="default" onClick={goBack} disabled={isSubmitting}>
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {t.common.save}
            </Button>
          </Group>
        </Stack>
      </Card>
    </PageLayout>
  );
}
