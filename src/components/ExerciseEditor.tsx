import { Button, Group, Input, NumberInput, Stack, Title } from "@mantine/core";
import { useExerciseEdtior } from "../hooks/useExerciseEditor";
import { type ExerciseTemplate } from "../store/db";

interface Props {
  exercise: ExerciseTemplate;
  sessionId: number;
}

export function ExerciseEditor({ exercise, sessionId }: Props) {
  const { exerciseLog, sets, addSet, updateSetWeight, updateSetReps } =
    useExerciseEdtior(exercise, sessionId);

  if (!exerciseLog && !sets) {
    return <div>Loading...</div>;
  }

  return (
    <Stack>
      <Title order={4}>{exercise.name}</Title>
      <Group>
        {(sets ?? []).map((set) => (
          <Group key={set.id}>
            <Input.Wrapper label="Weight">
              <NumberInput
                value={set.weight}
                onChange={async (weight) =>
                  updateSetWeight(Number(weight), set.id)
                }
                placeholder="Weight"
              />
            </Input.Wrapper>

            <Input.Wrapper label="Reps">
              <NumberInput
                value={set.reps}
                onChange={async (reps) => updateSetReps(Number(reps), set.id)}
                placeholder="Reps"
              />
            </Input.Wrapper>
          </Group>
        ))}

        <Button onClick={addSet}>Add Set</Button>
      </Group>
    </Stack>
  );
}
