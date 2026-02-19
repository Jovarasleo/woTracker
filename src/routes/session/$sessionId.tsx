import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type ExerciseLog, type ExerciseTemplate } from "../../store/db";
import { Stack, Title, Loader } from "@mantine/core";
import { ExerciseEditor } from "../../components/ExerciseEditor";

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const numericSessionId = Number(sessionId);

  // 1️⃣ Load session
  const session = useLiveQuery(
    () => db.workoutSessions.get(numericSessionId),
    [numericSessionId],
  );

  // 2️⃣ Load exercises for this session
  const exerciseLogsWithTemplate = useLiveQuery(async () => {
    if (!numericSessionId) return [];

    // 1️⃣ Get all logs for the session
    const logs = await db.exerciseLogs
      .where("sessionId")
      .equals(numericSessionId)
      .toArray();

    // 2️⃣ Map logs to full templates
    const results = await Promise.all(
      logs.map(async (log) => {
        const template = await db.exerciseTemplates.get(log.exerciseTemplateId);
        if (!template) {
          return null;
        }

        return { log, template };
      }),
    );

    // 3️⃣ Filter out nulls and assert type
    return results.filter(
      (item): item is { log: ExerciseLog; template: ExerciseTemplate } =>
        item !== null,
    );
  }, [numericSessionId]);

  if (!session || !exerciseLogsWithTemplate) return <Loader />;

  return (
    <Stack>
      <Title order={2}>{`Session: ${session.date}`}</Title>

      {exerciseLogsWithTemplate.map(({ log, template }) => (
        <ExerciseEditor
          key={log.id}
          exercise={template} // full ExerciseTemplate now
          sessionId={numericSessionId}
        />
      ))}
    </Stack>
  );
}
