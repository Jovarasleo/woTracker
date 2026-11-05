import { Button, Card, Group, Text } from "@mantine/core";
import { IconDatabase, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

/**
 * Local-development data controls. Renders nothing in production builds — the
 * guard below is statically `false` outside `vite dev`, and the seed helpers are
 * dynamically imported so they never ship in the production bundle.
 */
export function DevTools() {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!import.meta.env.DEV) {
    return null;
  }

  const handleSeed = async () => {
    setBusy(true);
    setStatus("Seeding dev data…");
    try {
      const { seedDevData } = await import("../dev/seedData");
      const summary = await seedDevData();
      setStatus(
        `Seeded ${summary.workouts} workouts, ${summary.sessions} sessions, ${summary.sets} sets.`,
      );
    } catch (error) {
      setStatus(`Seeding failed: ${String(error)}`);
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Delete ALL workout data? This cannot be undone.")) {
      return;
    }

    setBusy(true);
    setStatus("Deleting all data…");
    try {
      const { clearAllData } = await import("../dev/seedData");
      await clearAllData();
      setStatus("All data deleted.");
    } catch (error) {
      setStatus(`Delete failed: ${String(error)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card shadow="sm" padding="sm" withBorder className="mb-4">
      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          Dev tools — local only
        </Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            color="teal"
            loading={busy}
            leftSection={<IconDatabase size={16} />}
            onClick={handleSeed}
          >
            Seed data
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            loading={busy}
            leftSection={<IconTrash size={16} />}
            onClick={handleClear}
          >
            Delete all data
          </Button>
        </Group>
      </Group>
      {status && (
        <Text size="xs" c="dimmed" className="mt-2">
          {status}
        </Text>
      )}
    </Card>
  );
}
