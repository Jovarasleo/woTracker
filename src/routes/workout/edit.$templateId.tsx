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
import { useLiveQuery } from "dexie-react-hooks";
import { ExerciseCreator } from "../../components/exercise/ExerciseCreator";
import { PageLayout } from "../../components/shared/PageLayout";
import { TemplateExerciseList } from "../../components/workoutTemplate/TemplateExerciseList";
import { TemplateFormSkeleton } from "../../components/workoutTemplate/TemplateFormSkeleton";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import { useGoBack } from "../../hooks/shared/useGoBack";
import { useCustomExercises } from "../../hooks/exercise/useCustomExercises";
import { useTemplateEditor } from "../../hooks/workoutTemplate/useTemplateEditor";
import {
  useWorkoutTemplateForm,
  WORKOUT_NAME_MAX_LENGTH,
  type WorkoutTemplateFormValues,
} from "../../hooks/workoutTemplate/useWorkoutTemplateForm";
import type { ExerciseTemplate, WorkoutTemplate } from "../../store/db";
import { db, exerciseKindOf } from "../../store/db";
import { INDICATOR_COLORS } from "../../utils/colors";

export const Route = createFileRoute("/workout/edit/$templateId")({
  component: EditTemplatePage,
});

function EditTemplatePage() {
  const { templateId } = Route.useParams();
  const numericTemplateId = Number(templateId);

  const template = useLiveQuery(
    () => db.workoutTemplates.get(numericTemplateId),
    [numericTemplateId],
  );

  const exerciseTemplates = useLiveQuery(
    () =>
      db.exerciseTemplates
        .where("workoutTemplateId")
        .equals(numericTemplateId)
        .sortBy("order"),
    [numericTemplateId],
  );

  if (!template || !exerciseTemplates) {
    return (
      <PageLayout>
        <TemplateFormSkeleton />
      </PageLayout>
    );
  }

  // Remount the form (resetting its local draft) whenever the loaded template
  // changes, so initial values can be seeded straight from props.
  return (
    <TemplateEditForm
      key={template.id}
      template={template}
      exercises={exerciseTemplates}
    />
  );
}

interface TemplateEditFormProps {
  template: WorkoutTemplate;
  exercises: ExerciseTemplate[];
}

function TemplateEditForm({ template, exercises }: TemplateEditFormProps) {
  const goBack = useGoBack();
  const { indicatorColor, setIndicatorColor, save } = useTemplateEditor(
    template,
    exercises,
  );
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
  } = useWorkoutTemplateForm(
    {
      name: template.name,
      exercises: exercises.map((exercise) => ({
        templateExerciseId: exercise.id,
        name: exercise.name,
        kind: exerciseKindOf(exercise),
      })),
    },
    template.id,
  );
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

  const handleCancel = () => {
    goBack();
  };

  /** Runs only with valid, trimmed values; see `useWorkoutTemplateForm`. */
  const handleSave = async (values: WorkoutTemplateFormValues) => {
    await save(values);
    goBack();
  };

  return (
    <PageLayout title="Edit workout" subtitle={template.name}>
      <Card component="form" noValidate onSubmit={onSubmit(handleSave)}>
        <Stack>
          <TextInput
            {...register("name", nameRules)}
            label="Workout name"
            withAsterisk
            maxLength={WORKOUT_NAME_MAX_LENGTH}
            error={errors.name?.message}
          />

          <TemplateExerciseList
            fields={exerciseFields}
            register={register}
            nameRules={exerciseNameRules}
            errors={errors.exercises}
            minExercises={1}
            onRemove={removeExercise}
          />

          <Button
            variant="light"
            leftSection={<IconPlus size={18} />}
            onClick={openPicker}
          >
            Add exercise
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
            label="Indicator color"
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
            <Button variant="default" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save
            </Button>
          </Group>
        </Stack>
      </Card>
    </PageLayout>
  );
}
