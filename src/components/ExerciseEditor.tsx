import {
  ActionIcon,
  Button,
  Card,
  Input,
  NumberInput,
  Title,
} from "@mantine/core";
import { IconCheck, IconEdit, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useExerciseLogEditor } from "../hooks/useExerciseEditor";
import { type ExerciseLog } from "../store/db";

interface Props {
  exerciseLog: ExerciseLog;
  sessionId: number;
  editable: boolean;
  sessionEditable: boolean;
  onEditExercise: (exerciseId: number) => void;
  onDeleteExercise: (exerciseId: number) => void;
}

export function ExerciseEditor({
  exerciseLog,
  editable,
  sessionEditable,
  onEditExercise,
  onDeleteExercise,
}: Props) {
  const [activeSetId, setActiveSetId] = useState<number | null>(null);
  const { sets, addSet, deleteSet, updateSetWeight, updateSetReps } =
    useExerciseLogEditor(exerciseLog);

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
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2 h-9">
        <Title order={2}>{exerciseLog.name}</Title>
        {sessionEditable && (
          <Button
            variant="filled"
            color="red"
            onClick={() => onDeleteExercise(exerciseLog.id)}
          >
            Remove exercise
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 ">
        {(sets ?? []).map((set) => {
          const disabled = activeSetId !== set.id || !editable;
          return (
            <Card key={set.id} className="flex">
              {sessionEditable && (
                <ActionIcon
                  size="sm"
                  color="red"
                  className="self-start"
                  variant="subtle"
                  onClick={() => deleteSet(set.id)}
                >
                  <IconX />
                </ActionIcon>
              )}
              <div className="flex gap-4">
                <Input.Wrapper label="Weight" className="text-left">
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

                <Input.Wrapper label="Reps" className="text-left">
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
