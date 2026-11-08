import { Button, Modal, Text } from "@mantine/core";
import { type WorkoutSession } from "../../store/db";
import { formatDateTime } from "../../utils/dates";

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
    <Modal centered opened={opened} onClose={onClose} title="Delete session?">
      <Text size="sm" mb="md">
        <b>{session.name}</b> from {formatDateTime(session.date)} and all its
        logged sets will be removed. This can't be undone.
      </Text>
      <div className="flex justify-end gap-3">
        <Button variant="default" onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button color="red" loading={deleting} onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
