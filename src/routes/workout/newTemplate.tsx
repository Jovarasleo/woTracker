import {
  ActionIcon,
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
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CardioBadge } from "../../components/CardioBadge";
import { ExerciseCreator } from "../../components/ExerciseCreator";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import {
  useCustomExercises,
  type CustomExerciseDraft,
} from "../../hooks/useCustomExercises";
import { db, exerciseKindOf, type ExerciseKind } from "../../store/db";

interface TemplateExerciseDraft {
  name: string;
  kind: ExerciseKind;
}
import { INDICATOR_COLORS, randomIndicatorColor } from "../../utils/colors";

export const Route = createFileRoute("/workout/newTemplate")({
  component: NewWorkoutTemplate,
});

function NewWorkoutTemplate() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<TemplateExerciseDraft[]>([]);
  const [indicatorColor, setIndicatorColor] = useState(randomIndicatorColor);
  const { customExercises, addCustomExercise } = useCustomExercises();
  const [pickerOpened, { open: openPicker, close: closePicker }] =
    useDisclosure(false);

  const addExercise = (exerciseName: string, kind: ExerciseKind) => {
    setExercises([...exercises, { name: exerciseName, kind }]);
  };

  const updateExercise = (index: number, value: string) => {
    setExercises(
      exercises.map((exercise, i) =>
        i === index ? { ...exercise, name: value } : exercise,
      ),
    );
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSelectExercise = (exercise: LibraryExercise) => {
    addExercise(exercise.name, exercise.kind);
    closePicker();
  };

  const handleCreateCustomExercise = async (draft: CustomExerciseDraft) => {
    await addCustomExercise(draft);
    addExercise(draft.name, exerciseKindOf(draft));
    closePicker();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

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

        const filteredExercises = exercises.filter(
          (exercise) => exercise.name.trim() !== "",
        );

        if (!templateId) {
          throw new Error("Failed to create template");
        }

        await db.exerciseTemplates.bulkAdd(
          filteredExercises.map((exercise, index) => ({
            workoutTemplateId: templateId,
            name: exercise.name.trim(),
            kind: exercise.kind,
            order: index,
          })),
        );
      },
    );

    setName("");
    setExercises([]);
    setIndicatorColor(randomIndicatorColor());
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

        {exercises.length > 0 && (
          <Input.Wrapper label="Exercises">
            <Stack gap="xs" className="mt-1">
              {exercises.map((exercise, index) => (
                // Index key: keying by name would remount the input (and drop
                // focus) on every keystroke.
                <Group key={index} gap="xs" wrap="nowrap">
                  <TextInput
                    className="grow"
                    value={exercise.name}
                    rightSection={<CardioBadge kind={exercise.kind} />}
                    rightSectionWidth={
                      exercise.kind === "cardio" ? 64 : undefined
                    }
                    placeholder={`Exercise ${index + 1}`}
                    onChange={(e) =>
                      updateExercise(index, e.currentTarget.value)
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
        )}

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
          <Button onClick={handleSubmit}>Save Template</Button>
        </Group>
      </Stack>
    </Card>
  );
}
