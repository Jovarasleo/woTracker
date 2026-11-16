import {
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
import { countBackupRows, useBackup } from "../../hooks/backup/useBackup";
import { type BackupFile } from "../../store/db";
import { formatDateTime } from "../../utils/dates";
import { t } from "../../i18n/translations";

type Feedback = { type: "success" | "error"; message: string };

function formatCounts(counts: Record<string, number>) {
  return Object.entries(counts)
    .map(([table, count]) => t.backup.tableCount(table, count))
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
    if (busy) {
      return;
    }

    setPendingBackup(null);
    setFeedback(null);
  };

  const handleExport = async () => {
    try {
      const counts = await exportBackup();
      setFeedback({
        type: "success",
        message: t.backup.exported(formatCounts(counts)),
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: t.backup.exportFailed(String(error)),
      });
    }
  };

  const handleFileSelected = async (file: File | null) => {
    resetFileRef.current?.();
    if (!file) {
      return;
    }

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
    if (!pendingBackup) {
      return;
    }

    setBusy(true);
    try {
      await restoreBackup(pendingBackup);
      setFeedback({
        type: "success",
        message: t.backup.restored,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: t.backup.importFailed(String(error)),
      });
    } finally {
      setPendingBackup(null);
      setBusy(false);
    }
  };

  return (
    <>
      {/* keepMounted keeps the file input alive while the system picker is open */}
      <Menu position="bottom-start" width="target" keepMounted>
        <Menu.Target>
          <Button
            variant="default"
            fullWidth
            justify="flex-start"
            leftSection={<IconDatabase size={18} />}
          >
            {t.backup.menuButton}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{t.backup.menuLabel}</Menu.Label>
          <Menu.Item
            leftSection={<IconDownload size={16} />}
            onClick={handleExport}
          >
            {t.backup.export}
          </Menu.Item>
          <FileButton
            resetRef={resetFileRef}
            accept="application/json,.json"
            onChange={handleFileSelected}
          >
            {(props) => (
              <Menu.Item leftSection={<IconUpload size={16} />} {...props}>
                {t.backup.import}
              </Menu.Item>
            )}
          </FileButton>
        </Menu.Dropdown>
      </Menu>

      <Modal
        centered
        opened={pendingBackup !== null || feedback !== null}
        onClose={closeModal}
        title={
          pendingBackup ? t.backup.restoreTitle : t.backup.feedbackTitle
        }
      >
        {pendingBackup ? (
          <Stack>
            <Text size="sm">
              {t.backup.restoreWarning(
                (text) => <b>{text}</b>,
                pendingBackup.exportedAt === "unknown"
                  ? t.backup.unknownDate
                  : formatDateTime(pendingBackup.exportedAt),
              )}
            </Text>
            <List size="sm" className="list-disc">
              {Object.entries(countBackupRows(pendingBackup)).map(
                ([table, count]) => (
                  <List.Item key={table}>
                    {t.backup.tableCount(table, count)}
                  </List.Item>
                ),
              )}
            </List>
            <Group justify="flex-end">
              <Button variant="default" onClick={closeModal} disabled={busy}>
                {t.common.cancel}
              </Button>
              <Button color="red" loading={busy} onClick={handleConfirmImport}>
                {t.backup.replaceData}
              </Button>
            </Group>
          </Stack>
        ) : (
          <Stack>
            <Text size="sm" c={feedback?.type === "error" ? "red" : undefined}>
              {feedback?.message}
            </Text>
            <Group justify="flex-end">
              <Button onClick={closeModal}>{t.common.ok}</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
