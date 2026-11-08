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

interface Props {
  name: string;
  /** Library entry for this exercise; without one the name is plain text. */
  details?: LibraryExercise;
  fw?: MantineFontWeight | number;
}

/**
 * An exercise's name. When there is a description, pictures or instructions
 * for it, a small info icon follows the name and tapping either opens a quick
 * overview in a modal, so the user never leaves the page they are on.
 */
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
        aria-label={`${name} — show exercise details`}
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
