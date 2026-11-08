import { ActionIcon, Card, Menu, Text } from "@mantine/core";
import {
  IconChevronRight,
  IconClock,
  IconDotsVertical,
  IconList,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { TemplateSummary } from "../../hooks/home/useHomeOverview";
import { formatRelativeDay } from "../../utils/sessionStats";

interface Props {
  summary: TemplateSummary;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Home page card for one workout template. The whole card opens the template
 * (stretched link); the menu sits above the link for edit/delete.
 */
export function TemplateCard({ summary, onEdit, onDelete }: Props) {
  const { template, exerciseCount, lastSessionDate } = summary;

  return (
    <Card withBorder radius="lg" padding="md" className="group h-full">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: template.indicatorColor }}
      />

      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Link
            to="/workout/$templateId"
            params={{ templateId: template.id.toString() }}
            tabIndex={0}
            className="block truncate text-lg font-semibold outline-none after:absolute after:inset-0 after:rounded-(--mantine-radius-lg) focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-(--mantine-primary-color-filled)"
          >
            {template.name}
          </Link>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <Text size="sm" c="dimmed" className="flex items-center gap-1">
              <IconList size={14} />
              {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
            </Text>
            <Text size="sm" c="dimmed" className="flex items-center gap-1">
              <IconClock size={14} />
              {lastSessionDate
                ? formatRelativeDay(lastSessionDate)
                : "Not done yet"}
            </Text>
          </div>
        </div>

        <Menu position="bottom-end" shadow="md" width={160}>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              className="z-10"
              aria-label={`${template.name} options`}
            >
              <IconDotsVertical size={18} stroke={1.75} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconPencil size={16} />} onClick={onEdit}>
              Edit
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={onDelete}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      <Text
        size="sm"
        fw={500}
        c="blue.4"
        mt="md"
        className="flex items-center gap-1"
      >
        Open workout
        <IconChevronRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </Text>
    </Card>
  );
}
