import { Modal } from "@mantine/core";
import { FinishTimeForm } from "./FinishTimeForm";
import { type WorkoutSession } from "../../store/db";
import { t } from "../../i18n/translations";

interface Props {
  session: WorkoutSession;
  opened: boolean;
  onClose: () => void;
  onSave: (finishedAt: string) => Promise<void>;
}

export function FinishTimeModal({ session, opened, onClose, onSave }: Props) {
  return (
    <Modal
      centered
      opened={opened}
      onClose={onClose}
      title={t.session.editFinishTime}
    >
      <FinishTimeForm session={session} onCancel={onClose} onSave={onSave} />
    </Modal>
  );
}
