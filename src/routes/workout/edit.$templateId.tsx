import {
  Button,
  Card,
  ColorPicker,
  ColorSwatch,
  Group,
  Input,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { ExerciseCreator } from "../../components/ExerciseCreator";
import { TemplateExerciseList } from "../../components/TemplateExerciseList";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import {
  useCustomExercises,
  type CustomExerciseDraft,
} from "../../hooks/useCustomExercises";
import { useTemplateEditor } from "../../hooks/useTemplateEditor";
import {
  useWorkoutTemplateForm,
  WORKOUT_NAME_MAX_LENGTH,
  type WorkoutTemplateFormValues,
} from "../../hooks/useWorkoutTemplateForm";
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
    return <Loader />;
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
  const navigate = useNavigate();
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

  const handleCancel = () => {
    navigate({ to: "/" });
  };

  /** Runs only with valid, trimmed values; see `useWorkoutTemplateForm`. */
  const handleSave = async (values: WorkoutTemplateFormValues) => {
    await save(values);
    navigate({ to: "/" });
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      component="form"
      noValidate
      onSubmit={onSubmit(handleSave)}
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
          minExercises={1}
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
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
