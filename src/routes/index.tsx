import { Fragment } from "react/jsx-runtime";
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

  const workoutSessions = useLiveQuery(
    async () =>
      (await db.workoutSessions.toArray()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
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
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-wrap mt-5">
        {workoutTemplates?.map((template) => {
          return (
            <Fragment key={template.id}>
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
            </Fragment>
          );
        })}
      </ul>

      {!!workoutSessions?.length && (
        <Stack className="bottom-0 fixed left-0 right-0 ">
          <Title order={2}>Past Sessions</Title>
          <ScrollArea type="scroll" className="h-[40vh]">
            <div className="grid gap-2 sm:grid-cols-2 px-5">
              {workoutSessions?.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </ScrollArea>
        </Stack>
      )}
    </div>
  );
}
