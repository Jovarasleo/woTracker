import { Button, Loader, Stack, Title } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../store/db";

export const Route = createFileRoute("/workout/$templateId")({
  component: WorkoutPage,
});

function WorkoutPage() {
  const navigate = useNavigate();
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

  const startSession = async () => {
    if (!exerciseTemplates) return;

    const newSessionId = await db.workoutSessions.add({
      name: template?.name ?? "Unnamed",
      date: new Date().toISOString(),
    });

    await Promise.all(
      exerciseTemplates.map(async (exerciseTemplate) => {
        const logId = await db.exerciseLogs.add({
          name: exerciseTemplate.name,
          sessionId: newSessionId,
          exerciseTemplateId: exerciseTemplate.id!,
        });

        await db.setLogs.add({
          exerciseLogId: logId,
          weight: 0,
          reps: 0,
          setNumber: 1,
        });
      }),
    );

    navigate({
      to: "/session/$sessionId",
      params: { sessionId: newSessionId.toString() },
    });
  };

  if (!template || !exerciseTemplates) {
    return <Loader />;
  }

  return (
    <Stack>
      <Title order={2}>{template.name}</Title>
      {exerciseTemplates.map((exercise) => (
        <Title key={exercise.id} order={4}>
          {exercise.name}
        </Title>
      ))}
      <Button onClick={startSession}>Start Session</Button>
    </Stack>
  );
}
