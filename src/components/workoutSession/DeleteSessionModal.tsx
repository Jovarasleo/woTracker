import { Button, Modal, Text } from "@mantine/core";
import { type WorkoutSession } from "../../store/db";
import { formatDateTime } from "../../utils/dates";
import { t } from "../../i18n/translations";

interface Props {
  session: WorkoutSession;
  opened: boolean;
  /** True while the delete runs: the buttons are locked meanwhile. */
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Asks for confirmation before deleting a session and its logged sets. */
export function DeleteSessionModal({
  session,
  opened,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal centered opened={opened} onClose={onClose} title={t.session.deleteTitle}>
      <Text size="sm" mb="md">
        {t.session.deleteWarning(
          <b>{session.name}</b>,
          formatDateTime(session.date),
        )}
      </Text>
      <div className="flex justify-end gap-3">
        <Button variant="default" onClick={onClose} disabled={deleting}>
          {t.common.cancel}
        </Button>
        <Button color="red" loading={deleting} onClick={onConfirm}>
          {t.common.delete}
        </Button>
      </div>
    </Modal>
  );
}
