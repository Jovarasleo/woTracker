import { Button, Group, Stack, Title } from "@mantine/core";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import { ExerciseOverview } from "./ExerciseOverview";
import { t } from "../../i18n/translations";

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
          {t.common.back}
        </Button>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => onAdd(exercise)}
        >
          {t.common.add}
        </Button>
      </Group>
    </Stack>
  );
}
