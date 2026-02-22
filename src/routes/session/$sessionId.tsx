import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type ExerciseLog, type ExerciseTemplate } from "../../store/db";
import { Stack, Title, Loader } from "@mantine/core";
import { ExerciseEditor } from "../../components/ExerciseEditor";
import { useState } from "react";

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const [activeExerciseId, setActiveExerciseId] = useState<number | null>(null);
  const numericSessionId = Number(sessionId);

  const onEditExercise = (id: number) => {
    setActiveExerciseId(id);
  };

  const session = useLiveQuery(
    () => db.workoutSessions.get(numericSessionId),
    [numericSessionId],
  );

  const exerciseLogsWithTemplate = useLiveQuery(async () => {
    if (!numericSessionId) return [];

    const logs = await db.exerciseLogs
      .where("sessionId")
      .equals(numericSessionId)
      .toArray();

    const results = await Promise.all(
      logs.map(async (log) => {
        const template = await db.exerciseTemplates.get(log.exerciseTemplateId);
        if (!template) {
          return null;
        }

        return { log, template };
      }),
    );

    return results.filter(
      (item): item is { log: ExerciseLog; template: ExerciseTemplate } =>
        item !== null,
    );
  }, [numericSessionId]);

  if (!session || !exerciseLogsWithTemplate) return <Loader />;

  return (
    <Stack className="justify-center">
      <Title order={2}>{`Session: ${new Date(session.date).toLocaleString(
        "lt-LT",
        {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        },
      )}`}</Title>

      {exerciseLogsWithTemplate.map(({ log, template }) => (
        <ExerciseEditor
          key={log.id}
          exercise={template}
          sessionId={numericSessionId}
          editable={activeExerciseId === template.id}
          onEditExercise={onEditExercise}
        />
      ))}
    </Stack>
  );
}
