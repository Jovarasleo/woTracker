import { Button, Card, Group, Input, NumberInput, Title } from "@mantine/core";
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
    <div className="flex flex-col items-center">
      <Title order={4}>{exercise.name}</Title>
      <div className="flex flex-nowrap flex-col gap-4 max-w-96">
        {(sets ?? []).map((set) => (
          <div className="flex flex-col">
            <Card key={set.id}>
              <Group>
                <Input.Wrapper label="Weight" className="text-left">
                  <NumberInput
                    size="xs"
                    value={set.weight}
                    onChange={async (weight) =>
                      updateSetWeight(Number(weight), set.id)
                    }
                    placeholder="Weight"
                  />
                </Input.Wrapper>

                <Input.Wrapper label="Reps" className="text-left">
                  <NumberInput
                    size="xs"
                    value={set.reps}
                    onChange={async (reps) =>
                      updateSetReps(Number(reps), set.id)
                    }
                    placeholder="Reps"
                  />
                </Input.Wrapper>
              </Group>
            </Card>
          </div>
        ))}

        <Button onClick={addSet} className="self-end">
          Add Set
        </Button>
      </div>
    </div>
  );
}
