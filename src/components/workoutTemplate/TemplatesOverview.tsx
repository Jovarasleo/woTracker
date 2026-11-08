import {
  Badge,
  Button,
  Modal,
  Paper,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconBarbell, IconPlus } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TemplateCard } from "./TemplateCard";
import type { TemplateSummary } from "../../hooks/home/useHomeOverview";

interface Props {
  templates: TemplateSummary[];
  onDeleteTemplate: (templateId: number) => Promise<void>;
}

/**
 * Responsive grid of workout templates for the home page, with an empty state
 * and the delete-confirmation modal.
 */
export function TemplatesOverview({ templates, onDeleteTemplate }: Props) {
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState<TemplateSummary | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setDeleting(true);
    try {
      await onDeleteTemplate(pendingDelete.template.id);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section aria-labelledby="templates-heading">
      <div className="mb-3 flex items-center gap-2">
        <Title order={3} id="templates-heading">
          Workouts
        </Title>
        {templates.length > 0 && (
          <Badge variant="light" color="gray" radius="sm">
            {templates.length}
          </Badge>
        )}
      </div>

      {templates.length === 0 ? (
        <Paper
          withBorder
          radius="lg"
          p="xl"
          className="flex flex-col items-center gap-3 border-dashed text-center"
        >
          <ThemeIcon variant="light" size={56} radius="xl">
            <IconBarbell size={30} />
          </ThemeIcon>
          <div>
            <Text fw={600}>No workouts yet</Text>
            <Text size="sm" c="dimmed">
              Create a workout template to start logging sessions.
            </Text>
          </div>
          <Button
            component={Link}
            tabIndex={0}
            to="/workout/newTemplate"
            leftSection={<IconPlus size={18} />}
          >
            Create workout
          </Button>
        </Paper>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((summary) => (
            <li key={summary.template.id}>
              <TemplateCard
                summary={summary}
                onEdit={() =>
                  navigate({
                    to: "/workout/edit/$templateId",
                    params: { templateId: summary.template.id.toString() },
                  })
                }
                onDelete={() => setPendingDelete(summary)}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal
        centered
        opened={pendingDelete !== null}
        onClose={() => !deleting && setPendingDelete(null)}
        title="Delete workout template?"
      >
        <Text size="sm" mb="md">
          <b>{pendingDelete?.template.name}</b> and its exercise list will be
          removed. Sessions you already logged are kept.
        </Text>
        <div className="flex justify-end gap-3">
          <Button
            variant="default"
            onClick={() => setPendingDelete(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button color="red" loading={deleting} onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </section>
  );
}
