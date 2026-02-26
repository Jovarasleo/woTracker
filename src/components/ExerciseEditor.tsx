import {
  ActionIcon,
  Button,
  Card,
  Input,
  NumberInput,
  Title,
} from "@mantine/core";
import { IconCheck, IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import { useExerciseEdtior } from "../hooks/useExerciseEditor";
import { type ExerciseLog, type ExerciseTemplate } from "../store/db";

interface Props {
  exerciseLog: ExerciseLog | ExerciseTemplate;
  sessionId: number;
  editable: boolean;
  onEditExercise: (exerciseId: number) => void;
}

export function ExerciseEditor({
  exerciseLog,
  editable,
  onEditExercise,
}: Props) {
  const [activeSetId, setActiveSetId] = useState<number | null>(null);
  const { sets, addSet, updateSetWeight, updateSetReps } =
    useExerciseEdtior(exerciseLog);

  const onSetEditable = (exerciseId: number, setId: number) => {
    if (setId === activeSetId) {
      setActiveSetId(null);
      return;
    }

    onEditExercise(exerciseId);
    setActiveSetId(setId);
  };

  const addActiveSet = async () => {
    const setId = await addSet();
    onSetEditable(exerciseLog.id, setId);
  };

  if (!exerciseLog && !sets) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Title order={4}>{exerciseLog.name}</Title>
      <div className="flex flex-col gap-4 ">
        {(sets ?? []).map((set) => {
          const disabled = activeSetId !== set.id || !editable;
          return (
            <Card key={set.id} className="flex">
              <div className="flex gap-4">
                <Input.Wrapper
                  label="Weight"
                  className="text-left max-w-32 sm:max-w-max"
                >
                  <NumberInput
                    size="xs"
                    value={set.weight}
                    disabled={disabled}
                    onChange={(weight) =>
                      updateSetWeight(Number(weight), set.id)
                    }
                    placeholder="Weight"
                  />
                </Input.Wrapper>

                <Input.Wrapper
                  label="Reps"
                  className="text-left max-w-32 sm:max-w-max"
                >
                  <NumberInput
                    size="xs"
                    value={set.reps}
                    min={0}
                    disabled={disabled}
                    onChange={(reps) => updateSetReps(Number(reps), set.id)}
                    placeholder="Reps"
                  />
                </Input.Wrapper>
                <ActionIcon
                  className="self-end"
                  variant="subtle"
                  onClick={() => onSetEditable(exerciseLog.id, set.id)}
                >
                  {disabled ? (
                    <IconEdit
                      style={{ width: "70%", height: "70%" }}
                      stroke={1.75}
                    />
                  ) : (
                    <IconCheck
                      style={{ width: "70%", height: "70%" }}
                      stroke={1.75}
                    />
                  )}
                </ActionIcon>
              </div>
            </Card>
          );
        })}

        <Button
          variant="light"
          onClick={() => addActiveSet()}
          className="self-end"
        >
          Add Set
        </Button>
      </div>
    </div>
  );
}
