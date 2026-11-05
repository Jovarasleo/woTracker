import {
  ActionIcon,
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
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { CardioBadge } from "../../components/CardioBadge";
import { ExerciseCreator } from "../../components/ExerciseCreator";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import {
  useCustomExercises,
  type CustomExerciseDraft,
} from "../../hooks/useCustomExercises";
import { useTemplateEditor } from "../../hooks/useTemplateEditor";
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
  const {
    name,
    setName,
    indicatorColor,
    setIndicatorColor,
    editableExercises,
    updateExercise,
    removeExercise,
    addExercise,
    canSave,
    save,
  } = useTemplateEditor(template, exercises);
  const { customExercises, addCustomExercise } = useCustomExercises();
  const [pickerOpened, { open: openPicker, close: closePicker }] =
    useDisclosure(false);

  const handleSelectExercise = (exercise: LibraryExercise) => {
    addExercise(exercise.name, exercise.kind);
    closePicker();
  };

  const handleCreateCustomExercise = async (draft: CustomExerciseDraft) => {
    await addCustomExercise(draft);
    addExercise(draft.name, exerciseKindOf(draft));
    closePicker();
  };

  const handleCancel = () => {
    navigate({ to: "/" });
  };

  const handleSave = async () => {
    await save();
    navigate({ to: "/" });
  };

  return (
    <Card shadow="sm" padding="lg">
      <Stack>
        <TextInput
          label="Workout Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />

        <Input.Wrapper label="Exercises">
          <Stack gap="xs" className="mt-1">
            {editableExercises.map((exercise, index) => (
              <Group key={exercise.id ?? `new-${index}`} gap="xs" wrap="nowrap">
                <TextInput
                  className="grow"
                  value={exercise.name}
                  placeholder={`Exercise ${index + 1}`}
                  onChange={(e) => updateExercise(index, e.currentTarget.value)}
                  rightSection={<CardioBadge kind={exercise.kind} />}
                  rightSectionWidth={
                    exercise.kind === "cardio" ? 64 : undefined
                  }
                />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label="Remove exercise"
                  onClick={() => removeExercise(index)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        </Input.Wrapper>

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
          <Button onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
