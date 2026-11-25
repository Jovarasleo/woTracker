import { Modal } from "@mantine/core";
import { SaveAsTemplateForm } from "./SaveAsTemplateForm";
import { exerciseKindOf, type ExerciseLog } from "../../store/db";
import { t } from "../../i18n/translations";

interface Props {
  opened: boolean;
  defaultName: string;
  exerciseLogs: ExerciseLog[];
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

/** The form only mounts while open, so it starts from the current values. */
export function SaveAsTemplateModal({
  opened,
  defaultName,
  exerciseLogs,
  onClose,
  onSave,
}: Props) {
  return (
    <Modal centered opened={opened} onClose={onClose} title={t.session.saveAsTemplate}>
      <SaveAsTemplateForm
        defaultName={defaultName}
        exercises={exerciseLogs.map((log) => ({
          name: log.name,
          kind: exerciseKindOf(log),
        }))}
        onCancel={onClose}
        onSave={onSave}
      />
    </Modal>
  );
}
