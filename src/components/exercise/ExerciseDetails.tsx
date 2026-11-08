import {
  Badge,
  Button,
  Group,
  Image,
  List,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { type LibraryExercise } from "../../data/exerciseCatalog";

interface Props {
  exercise: LibraryExercise;
  onBack: () => void;
  onAdd: (exercise: LibraryExercise) => void;
}

export function ExerciseDetails({ exercise, onBack, onAdd }: Props) {
  const tags = [
    exercise.source === "custom" ? "custom" : null,
    exercise.category ?? (exercise.kind === "cardio" ? "cardio" : null),
    exercise.level,
    exercise.equipment,
  ].filter((tag): tag is string => Boolean(tag));

  return (
    <Stack>
      <div className="text-left">
        <Title order={4}>{exercise.name}</Title>
        <Group gap={6} className="mt-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="light" size="sm">
              {tag}
            </Badge>
          ))}
        </Group>
      </div>

      {exercise.imageUrls.length > 0 && (
        <SimpleGrid cols={2} spacing="xs">
          {exercise.imageUrls.map((url, index) => (
            <Image
              key={url}
              src={url}
              alt={`${exercise.name} — step ${index + 1}`}
              radius="sm"
              loading="lazy"
            />
          ))}
        </SimpleGrid>
      )}

      {exercise.primaryMuscles.length > 0 && (
        <Text size="sm" className="text-left capitalize">
          <Text span c="dimmed" size="sm">
            Muscles:{" "}
          </Text>
          {[...exercise.primaryMuscles, ...exercise.secondaryMuscles].join(
            ", ",
          )}
        </Text>
      )}

      {exercise.description && (
        <Text size="sm" className="text-left whitespace-pre-line">
          {exercise.description}
        </Text>
      )}

      {exercise.instructions.length > 0 && (
        <List type="ordered" size="sm" spacing={6} className="list-decimal">
          {exercise.instructions.map((step, index) => (
            <List.Item key={index}>{step}</List.Item>
          ))}
        </List>
      )}

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
