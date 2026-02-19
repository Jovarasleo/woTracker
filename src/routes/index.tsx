import { createFileRoute, Link } from "@tanstack/react-router";
import { CreateTemplateForm } from "../components/CreateTemplateForm";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type WorkoutTemplate } from "../store/db";
import { Button, Card, Stack, Title } from "@mantine/core";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const workoutTemplates = useLiveQuery(
    () => db.workoutTemplates?.toArray(),
    [],
  );

  const sessionsWithTemplate = useLiveQuery(async () => {
    const sessions = await db.workoutSessions.toArray();

    const results = await Promise.all(
      sessions.map(async (session) => {
        const template = await db.workoutTemplates.get(
          session.workoutTemplateId,
        );
        if (!template) return null; // skip if template missing
        return { session, template };
      }),
    );

    return results.filter(
      (
        item,
      ): item is { session: (typeof sessions)[0]; template: WorkoutTemplate } =>
        item !== null,
    );
  }, []);

  return (
    <div className="p-2">
      <CreateTemplateForm />
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 flex-wrap">
        {workoutTemplates?.map((template) => {
          return (
            <li key={template.id}>
              <Card key={template.id} shadow="sm" padding="lg" className="mt-3">
                <Stack>
                  <Title order={4}>{template.name}</Title>
                  <Link
                    to="/workout/$templateId"
                    params={{ templateId: template.id!.toString() }}
                  >
                    <Button>Start Workout</Button>
                  </Link>
                </Stack>
              </Card>
            </li>
          );
        })}
      </ul>
      <Title order={2}>Past Sessions</Title>
      <Stack>
        {sessionsWithTemplate?.map(({ session, template }) => (
          <Card key={session.id} shadow="sm" padding="lg">
            <Stack>
              <Title
                order={4}
              >{`${template.name} — ${new Date(session.date).toLocaleString()}`}</Title>

              <Link
                to="/session/$sessionId"
                params={{ sessionId: session.id!.toString() }}
              >
                <Button>Continue / View</Button>
              </Link>
            </Stack>
          </Card>
        ))}
      </Stack>
    </div>
  );
}
