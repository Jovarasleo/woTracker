import { Fragment } from "react/jsx-runtime";
import {
  ActionIcon,
  Button,
  Card,
  ColorSwatch,
  Modal,
  Stack,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDotsVertical, IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { DevTools } from "../components/DevTools";
import { SessionCalendar } from "../components/SessionCalendar";
import { db } from "../store/db";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
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
      <DevTools />
      <div className="text-end">
        <Link to="/workout/new">
          <Button size="md" leftSection={<IconPlus />}>
            Workout Template
          </Button>
        </Link>
      </div>
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
                      <ColorSwatch
                        color={template.indicatorColor}
                        size={16}
                        className="col-start-1 justify-self-start"
                      />
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
        <Stack className="mt-8">
          <Title order={2}>Past Sessions</Title>
          <SessionCalendar
            sessions={workoutSessions}
            onSelectSession={(sessionId) =>
              navigate({
                to: "/session/$sessionId",
                params: { sessionId: sessionId.toString() },
              })
            }
          />
        </Stack>
      )}
    </div>
  );
}
