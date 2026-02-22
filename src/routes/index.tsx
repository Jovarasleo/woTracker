import {
  ActionIcon,
  Button,
  Card,
  Modal,
  ScrollArea,
  Stack,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDotsVertical, IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { SessionCard } from "../components/SessionCard";
import { db } from "../store/db";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [opened, { open, close }] = useDisclosure(false);
  const workoutTemplates = useLiveQuery(
    () => db.workoutTemplates?.toArray(),
    [],
  );

  const sessionsWithTemplate = useLiveQuery(
    async () => db.workoutSessions.toArray(),
    [],
  );

  async function deleteWorkoutTemplate(templateId: number, close: () => void) {
    await db.workoutTemplates.delete(templateId);
    close();
  }

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
            <>
              <Modal
                centered
                opened={opened}
                onClose={close}
                title="Delete workout template?"
              >
                <div className="flex gap-4 justify-end">
                  <Button
                    variant="filled"
                    color="red"
                    onClick={() => deleteWorkoutTemplate(template.id, close)}
                  >
                    Delete
                  </Button>
                  <Button variant="outline" onClick={close}>
                    Close
                  </Button>
                </div>
              </Modal>
              <li key={template.id}>
                <Card shadow="sm" padding="sm">
                  <Stack>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full">
                      <Title order={4} className="text-center col-start-2">
                        {template.name}
                      </Title>
                      <ActionIcon
                        className="col-start-3 justify-self-end"
                        variant="subtle"
                        onClick={open}
                      >
                        <IconDotsVertical
                          size={18}
                          stroke={1.75}
                          className="text-gray-200"
                        />
                      </ActionIcon>
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
            </>
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
          <Stack gap="sm" p="sm">
            {sessionsWithTemplate?.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </Stack>
        </ScrollArea>
      </Stack>
    </div>
  );
}
