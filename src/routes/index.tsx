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
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { DevTools } from "../components/DevTools";
import { SessionsOverview } from "../components/SessionsOverview";
import { db } from "../store/db";
import { useState } from "react";

interface IndexSearch {
  /** Calendar month currently displayed, in `YYYY-MM` format. */
  month?: string;
}

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => ({
    month:
      typeof search.month === "string" && MONTH_PATTERN.test(search.month)
        ? search.month
        : undefined,
  }),
  component: Index,
});

function Index() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [opened, { open, close }] = useDisclosure(false);
  const workoutTemplates = useLiveQuery(
    () => db.workoutTemplates?.toArray(),
    [],
  );

  async function deleteWorkoutTemplate(templateId: number, close: () => void) {
    await db.workoutTemplates.delete(templateId);
    close();
  }

  const handleOpenModal = (templateId: number) => {
    setSelectedTemplateId(templateId);
    open();
  };

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
        {workoutTemplates?.map((template) => (
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
                    onClick={() => handleOpenModal(template.id)}
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
        ))}
      </ul>

      <SessionsOverview />

      <Modal
        centered
        opened={opened && selectedTemplateId !== null}
        onClose={close}
        title="Delete workout template?"
      >
        <div className="flex gap-4 justify-end">
          <Button
            variant="filled"
            color="red"
            onClick={() =>
              selectedTemplateId !== null &&
              deleteWorkoutTemplate(selectedTemplateId, close)
            }
          >
            Delete
          </Button>
          <Button variant="outline" onClick={close}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
