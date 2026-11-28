import { Modal } from "@mantine/core";
import { SaveAsTemplateForm } from "./SaveAsTemplateForm";
import { exerciseKindOf, type SessionExercise } from "../../store/db";
import { t } from "../../i18n/translations";

interface Props {
  opened: boolean;
  defaultName: string;
  exerciseLogs: SessionExercise[];
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

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
