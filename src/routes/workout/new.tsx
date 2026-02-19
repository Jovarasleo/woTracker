import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { db } from "../../store/db";
import { Button, Card, Group, Stack, TextInput } from "@mantine/core";
import { useState } from "react";

export const Route = createFileRoute("/workout/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<string[]>([""]);

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

        <Group justify="flex-end">
          <Button onClick={handleSubmit}>Save Template</Button>
        </Group>
      </Stack>
    </Card>
  );
}
