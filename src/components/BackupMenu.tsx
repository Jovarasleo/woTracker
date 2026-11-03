import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  List,
  Menu,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { IconDatabase, IconDownload, IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { countBackupRows, useBackup } from "../hooks/useBackup";
import { type BackupFile } from "../store/db";

type Feedback = { type: "success" | "error"; message: string };

function formatCounts(counts: Record<string, number>) {
  return Object.entries(counts)
    .map(([table, count]) => `${table}: ${count}`)
    .join(", ");
}

/**
 * Header menu for exporting all app data to a JSON file and restoring it from
 * one. Import always asks for confirmation before replacing data.
 */
export function BackupMenu() {
  const { exportBackup, parseBackupFile, restoreBackup } = useBackup();
  const [pendingBackup, setPendingBackup] = useState<BackupFile | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const resetFileRef = useRef<() => void>(null);

  const closeModal = () => {
    if (busy) return;
    setPendingBackup(null);
    setFeedback(null);
  };

  const handleExport = async () => {
    try {
      const counts = await exportBackup();
      setFeedback({
        type: "success",
        message: `Backup downloaded (${formatCounts(counts)}).`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: `Export failed: ${String(error)}`,
      });
    }
  };

  const handleFileSelected = async (file: File | null) => {
    resetFileRef.current?.();
    if (!file) return;

    try {
      setPendingBackup(await parseBackupFile(file));
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingBackup) return;

    setBusy(true);
    try {
      await restoreBackup(pendingBackup);
      setFeedback({
        type: "success",
        message:
          "Backup restored. Your previous data was downloaded as wotracker-before-import.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: `Import failed, no data was changed: ${String(error)}`,
      });
    } finally {
      setPendingBackup(null);
      setBusy(false);
    }
  };

  return (
    <>
      {/* keepMounted keeps the file input alive while the system picker is open */}
      <Menu position="bottom-end" keepMounted>
        <Menu.Target>
          <ActionIcon
            variant="default"
            size="input-md"
            aria-label="Backup and restore"
          >
            <IconDatabase size={20} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Backup</Menu.Label>
          <Menu.Item
            leftSection={<IconDownload size={16} />}
            onClick={handleExport}
          >
            Export data
          </Menu.Item>
          <FileButton
            resetRef={resetFileRef}
            accept="application/json,.json"
            onChange={handleFileSelected}
          >
            {(props) => (
              <Menu.Item leftSection={<IconUpload size={16} />} {...props}>
                Import data
              </Menu.Item>
            )}
          </FileButton>
        </Menu.Dropdown>
      </Menu>

      <Modal
        centered
        opened={pendingBackup !== null || feedback !== null}
        onClose={closeModal}
        title={pendingBackup ? "Restore backup?" : "Backup"}
      >
        {pendingBackup ? (
          <Stack>
            <Text size="sm">
              This replaces <b>all</b> current workouts, sessions and sets with
              the backup from{" "}
              {pendingBackup.exportedAt === "unknown"
                ? "an unknown date"
                : new Date(pendingBackup.exportedAt).toLocaleString("lt-LT")}
              . Your current data is downloaded as a file first.
            </Text>
            <List size="sm" className="text-left">
              {Object.entries(countBackupRows(pendingBackup)).map(
                ([table, count]) => (
                  <List.Item key={table}>
                    {table}: {count}
                  </List.Item>
                ),
              )}
            </List>
            <Group justify="flex-end">
              <Button variant="outline" onClick={closeModal} disabled={busy}>
                Cancel
              </Button>
              <Button color="red" loading={busy} onClick={handleConfirmImport}>
                Replace data
              </Button>
            </Group>
          </Stack>
        ) : (
          <Stack>
            <Text size="sm" c={feedback?.type === "error" ? "red" : undefined}>
              {feedback?.message}
            </Text>
            <Group justify="flex-end">
              <Button onClick={closeModal}>OK</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
