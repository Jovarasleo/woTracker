import {
  Modal,
  Text,
  UnstyledButton,
  type MantineFontWeight,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconInfoCircle } from "@tabler/icons-react";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import { ExerciseOverview } from "./ExerciseOverview";
import { t } from "../../i18n/translations";

interface Props {
  name: string;
  details?: LibraryExercise;
  fw?: MantineFontWeight | number;
}

export function ExerciseName({ name, details, fw }: Props) {
  const [opened, { open, close }] = useDisclosure(false);

  if (!details || !hasOverview(details)) {
    return (
      <Text fw={fw} className="text-left">
        {name}
      </Text>
    );
  }

  return (
    <>
      <UnstyledButton
        className="text-left"
        aria-haspopup="dialog"
        aria-label={t.exercise.showDetails(name)}
        onClick={open}
      >
        <Text span fw={fw}>
          {name}
        </Text>
        <IconInfoCircle
          size={16}
          aria-hidden
          className="inline ml-1 align-[-2px] text-(--mantine-color-dimmed)"
        />
      </UnstyledButton>

      <Modal centered size="lg" opened={opened} onClose={close} title={name}>
        <ExerciseOverview exercise={details} />
      </Modal>
    </>
  );
}

function hasOverview(exercise: LibraryExercise) {
  return (
    Boolean(exercise.description) ||
    exercise.imageUrls.length > 0 ||
    exercise.instructions.length > 0
  );
}
