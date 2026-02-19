import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../store/db";
import { Stack, Title, Loader, Button } from "@mantine/core";
import { ExerciseEditor } from "../../components/ExerciseEditor";

export const Route = createFileRoute("/workout/$templateId")({
  component: WorkoutPage,
});

function WorkoutPage() {
  const { templateId } = Route.useParams();
  const numericTemplateId = Number(templateId);

  const [sessionId, setSessionId] = useState<number | null>(null);

  const template = useLiveQuery(
    () => db.workoutTemplates.get(numericTemplateId),
    [numericTemplateId],
  );

  const exercises = useLiveQuery(
    () =>
      db.exerciseTemplates
        .where("workoutTemplateId")
        .equals(numericTemplateId)
        .sortBy("order"),
    [numericTemplateId],
  );

  const startSession = async () => {
    const newSessionId = await db.workoutSessions.add({
      workoutTemplateId: numericTemplateId,
      date: new Date().toISOString(),
    });

    setSessionId(newSessionId);
  };

  if (!template || !exercises) {
    return <Loader />;
  }

  return (
    <Stack>
      <Title order={2}>{template.name}</Title>

      {exercises.map((exercise) => (
        <Title key={exercise.id} order={4}>
          {exercise.name}
        </Title>
      ))}

      {!sessionId && <Button onClick={startSession}>Start Session</Button>}

      {sessionId && <Title order={4}>Session started (ID: {sessionId})</Title>}

      {sessionId &&
        exercises.map((exercise) => (
          <ExerciseEditor
            key={exercise.id}
            exercise={exercise}
            sessionId={sessionId}
          />
        ))}
    </Stack>
  );
}
