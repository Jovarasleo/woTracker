import { Button, Card, ScrollArea, Stack, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type WorkoutTemplate } from "../store/db";
import { SessionCard } from "../components/SessionCard";

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
    <div>
      <Link to="/workout/new">
        <Button size="md" leftSection={<IconPlus />}>
          Workout Template
        </Button>
      </Link>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-wrap mt-3">
        {workoutTemplates?.map((template) => {
          return (
            <li key={template.id}>
              <Card shadow="sm" padding="sm">
                <Stack>
                  <div>
                    <Title order={4}>{template.name}</Title>
                  </div>
                  <Link
                    to="/workout/$templateId"
                    params={{ templateId: template.id!.toString() }}
                  >
                    <Button color="green">Start</Button>
                  </Link>
                </Stack>
              </Card>
            </li>
          );
        })}
      </ul>

      <Stack className="bottom-0 fixed left-0 right-0 ">
        <Title order={2}>Past Sessions</Title>
        <ScrollArea
          style={{
            height: "50vh",
          }}
          type="auto"
        >
          {sessionsWithTemplate?.map(({ session, template }) => (
            <SessionCard
              key={session.id}
              session={session}
              template={template}
            />
          ))}
        </ScrollArea>
      </Stack>
    </div>
  );
}
