import {
  ActionIcon,
  Button,
  Card,
  ColorSwatch,
  Menu,
  Modal,
  Stack,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db } from "../store/db";

/**
 * Grid of workout templates on the home page. Each card can be started, and its
 * menu edits the template or opens the delete-confirmation modal.
 */
export function TemplatesOverview() {
  const navigate = useNavigate();
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
    <>
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
                  <Menu position="bottom-end" shadow="md" width={160}>
                    <Menu.Target>
                      <ActionIcon
                        className="col-start-3 justify-self-end"
                        variant="subtle"
                        aria-label="Template options"
                      >
                        <IconDotsVertical
                          size={18}
                          stroke={1.75}
                          className="text-gray-200"
                        />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconPencil size={16} />}
                        onClick={() =>
                          navigate({
                            to: "/workout/edit/$templateId",
                            params: { templateId: template.id.toString() },
                          })
                        }
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={16} />}
                        onClick={() => handleOpenModal(template.id)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
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
    </>
  );
}
