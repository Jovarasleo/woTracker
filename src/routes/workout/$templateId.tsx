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
    if (!exercises) return;

    const newSessionId = await db.workoutSessions.add({
      workoutTemplateId: numericTemplateId,
      date: new Date().toISOString(),
    });

    await Promise.all(
      exercises.map(async (exercise) => {
        const logId = await db.exerciseLogs.add({
          sessionId: newSessionId,
          exerciseTemplateId: exercise.id!,
        });

        await db.setLogs.add({
          exerciseLogId: logId,
          weight: 0,
          reps: 0,
          setNumber: 1,
        });
      }),
    );

    setSessionId(newSessionId);
  };

  if (!template || !exercises) {
    return <Loader />;
  }

  return (
    <Stack>
      <Title order={2}>{template.name}</Title>
      {!sessionId && (
        <>
          {exercises.map((exercise) => (
            <Title key={exercise.id} order={4}>
              {exercise.name}
            </Title>
          ))}
          <Button onClick={startSession}>Start Session</Button>
        </>
      )}

      {sessionId && (
        <>
          <Title order={4}>Session started (ID: {sessionId})</Title>
          {exercises.map((exercise) => (
            <ExerciseEditor
              key={exercise.id}
              exercise={exercise}
              sessionId={sessionId}
            />
          ))}
        </>
      )}
    </Stack>
  );
}
