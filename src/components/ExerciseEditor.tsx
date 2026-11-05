import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Stack,
  Text,
} from "@mantine/core";
import { IconCheck, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { PreviousSetsHint } from "./PreviousSetsHint";
import { useExerciseLogEditor } from "../hooks/useExerciseLogEditor";
import { type PreviousPerformance } from "../hooks/usePreviousExerciseSets";
import { type ExerciseLog } from "../store/db";

interface Props {
  exerciseLog: ExerciseLog;
  sessionId: number;
  editable: boolean;
  sessionEditable: boolean;
  onEditExercise: (exerciseId: number) => void;
  onDeleteExercise: (exerciseId: number) => void;
  /** Sets from the last time this exercise was done, shown as a hint. */
  previous?: PreviousPerformance;
}

export function ExerciseEditor({
  exerciseLog,
  previous,
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

  if (!sets) {
    return <div>Loading...</div>;
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between" wrap="nowrap" className="min-h-7 mb-2">
        <div className="min-w-0">
          <Text fw={600} className="text-left">
            {exerciseLog.name}
          </Text>
          {previous && <PreviousSetsHint previous={previous} />}
        </div>
        {sessionEditable && (
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label="Remove exercise"
            onClick={() => onDeleteExercise(exerciseLog.id)}
          >
            <IconTrash size={18} />
          </ActionIcon>
        )}
      </Group>

      {sets.length > 0 && (
        <Group gap="xs" wrap="nowrap" className="-mb-1">
          <div className="w-5 shrink-0" />
          <Text size="sm" fw={500} className="flex-1 text-left">
            Weight
          </Text>
          <Text size="sm" fw={500} className="flex-1 text-left">
            Reps
          </Text>
          <div className="w-8.5 shrink-0" />
          {sessionEditable && <div className="w-8.5 shrink-0" />}
        </Group>
      )}

      {sets.map((set, index) => {
        const disabled = activeSetId !== set.id || !editable;

        return (
          <Group key={set.id} gap="xs" wrap="nowrap" align="center">
            <Text size="sm" c="dimmed" className="w-5 shrink-0">
              {index + 1}
            </Text>
            <NumberInput
              className="flex-1"
              value={set.weight}
              min={0}
              disabled={disabled}
              onChange={(weight) => updateSetWeight(Number(weight), set.id)}
              placeholder="Weight"
            />
            <NumberInput
              className="flex-1"
              value={set.reps}
              min={0}
              disabled={disabled}
              onChange={(reps) => updateSetReps(Number(reps), set.id)}
              placeholder="Reps"
            />
            <ActionIcon
              variant="subtle"
              size="lg"
              aria-label={disabled ? "Edit set" : "Confirm set"}
              onClick={() => onSetEditable(exerciseLog.id, set.id)}
            >
              {disabled ? <IconEdit size={18} /> : <IconCheck size={18} />}
            </ActionIcon>
            {sessionEditable && (
              <ActionIcon
                variant="subtle"
                color="red"
                size="lg"
                aria-label="Remove set"
                onClick={() => deleteSet(set.id)}
              >
                <IconTrash size={18} />
              </ActionIcon>
            )}
          </Group>
        );
      })}

      <Button
        variant="light"
        size="xs"
        leftSection={<IconPlus size={16} />}
        onClick={() => addActiveSet()}
      >
        Add Set
      </Button>
    </Stack>
  );
}
