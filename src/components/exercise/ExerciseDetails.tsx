import { Button, Group, Stack, Title } from "@mantine/core";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import { ExerciseOverview } from "./ExerciseOverview";

interface Props {
  exercise: LibraryExercise;
  onBack: () => void;
  onAdd: (exercise: LibraryExercise) => void;
}

export function ExerciseDetails({ exercise, onBack, onAdd }: Props) {
  return (
    <Stack>
      <Title order={4} className="text-left">
        {exercise.name}
      </Title>

      <ExerciseOverview exercise={exercise} />

      <Group justify="flex-end">
        <Button
          variant="default"
          leftSection={<IconArrowLeft size={18} />}
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => onAdd(exercise)}
        >
          Add
        </Button>
      </Group>
    </Stack>
  );
}
