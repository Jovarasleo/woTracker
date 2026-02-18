import { createFileRoute } from "@tanstack/react-router";
import { CreateTemplateForm } from "../components/CreateTemplateForm";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../store/db";
import { Button, Card, Stack, Title } from "@mantine/core";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const workoutTemplates = useLiveQuery(
    () => db.workoutTemplates?.toArray(),
    [],
  );

  return (
    <div className="p-2">
      <h3>Home page</h3>
      <CreateTemplateForm />
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 flex-wrap">
        {workoutTemplates?.map((template) => (
          <li key={template.id}>
            <Card key={template.id} shadow="sm" padding="lg" className="mt-3">
              <Stack>
                <Title order={4}>{template.name}</Title>
                <Button onClick={() => console.log("click")}>
                  Start Workout
                </Button>
              </Stack>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
