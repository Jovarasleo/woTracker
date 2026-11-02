import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { db } from "../../store/db";
import {
  Button,
  Card,
  ColorPicker,
  ColorSwatch,
  Group,
  Input,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import { INDICATOR_COLORS, randomIndicatorColor } from "../../utils/colors";

export const Route = createFileRoute("/workout/newTemplate")({
  component: NewWorkoutTemplate,
});

function NewWorkoutTemplate() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<string[]>([""]);
  const [indicatorColor, setIndicatorColor] = useState(randomIndicatorColor);

  const addExerciseField = () => {
    setExercises([...exercises, ""]);
  };

  const updateExercise = (index: number, value: string) => {
    const updated = [...exercises];
    updated[index] = value;
    setExercises(updated);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

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

        const filteredExercises = exercises.filter((e) => e.trim() !== "");

        if (!templateId) throw new Error("Failed to create template");

        await db.exerciseTemplates.bulkAdd(
          filteredExercises.map((exercise, index) => ({
            workoutTemplateId: templateId,
            name: exercise,
            order: index,
          })),
        );
      },
    );

    setName("");
    setExercises([""]);
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

        {exercises.map((exercise, index) => (
          <TextInput
            key={index}
            label={`Exercise ${index + 1}`}
            value={exercise}
            onChange={(e) => updateExercise(index, e.currentTarget.value)}
          />
        ))}

        <Button variant="light" onClick={addExerciseField}>
          Add Exercise
        </Button>

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
