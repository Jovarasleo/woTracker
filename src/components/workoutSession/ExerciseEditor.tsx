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
import { CardioEditor } from "./CardioEditor";
import { PreviousPerformanceHint } from "./PreviousPerformanceHint";
import { SetRowSkeleton } from "./SetRowSkeleton";
import { type UndoAction } from "../../hooks/shared/useUndo";
import { useExerciseLogEditor } from "../../hooks/workoutSession/useExerciseLogEditor";
import { type PreviousPerformance } from "../../hooks/workoutSession/usePreviousPerformance";
import { ExerciseName } from "../exercise/ExerciseName";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import { exerciseKindOf, type ExerciseLog } from "../../store/db";

interface Props {
  exerciseLog: ExerciseLog;
  sessionId: number;
  editable: boolean;
  sessionEditable: boolean;
  onEditExercise: (exerciseId: number) => void;
  onDeleteExercise: (exerciseId: number) => void;
  /** Called after a set is deleted, so the page can offer to undo it. */
  onSetDeleted: (action: UndoAction) => void;
  /** What was logged the last time this exercise was done, shown as a hint. */
  previous?: PreviousPerformance;
  /** Library entry for this exercise, opened from its name. */
  details?: LibraryExercise;
}

export function ExerciseEditor({
  exerciseLog,
  previous,
  details,
  editable,
  sessionEditable,
  onEditExercise,
  onDeleteExercise,
  onSetDeleted,
}: Props) {
  const [activeSetId, setActiveSetId] = useState<number | null>(null);
  const [cardioEditing, setCardioEditing] = useState(false);
  const {
    sets,
    addSet,
    canDeleteSet,
    deleteSet,
    updateSetWeight,
    updateSetReps,
    updateCardio,
  } = useExerciseLogEditor(exerciseLog, { onDeleted: onSetDeleted });
  const isCardio = exerciseKindOf(exerciseLog) === "cardio";
  // Locked unless this exercise is the active one and its edit toggle is on.
  const cardioLocked = !cardioEditing || !editable;

  const onSetEditable = (exerciseId: number, setId: number) => {
    if (setId === activeSetId) {
      setActiveSetId(null);
      return;
    }

    onEditExercise(exerciseId);
    setActiveSetId(setId);
  };

  const toggleCardioEditing = () => {
    if (cardioLocked) {
      onEditExercise(exerciseLog.id);
      setCardioEditing(true);
      return;
    }

    setCardioEditing(false);
  };

  const addActiveSet = async () => {
    const setId = await addSet();
    onSetEditable(exerciseLog.id, setId);
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between" wrap="nowrap" className="min-h-7 mb-2">
        <div className="min-w-0">
          <ExerciseName name={exerciseLog.name} details={details} fw={600} />
          {previous && <PreviousPerformanceHint previous={previous} />}
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

      {isCardio ? (
        <CardioEditor
          metrics={exerciseLog}
          disabled={cardioLocked}
          onToggleEdit={toggleCardioEditing}
          onChange={updateCardio}
        />
      ) : (
        <>
          {/* Sets still loading: new exercises start with one set. */}
          {(!sets || sets.length > 0) && (
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

          {!sets && <SetRowSkeleton />}

          {sets?.map((set, index) => {
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
                  inputMode="decimal"
                />
                <NumberInput
                  className="flex-1"
                  value={set.reps}
                  min={0}
                  disabled={disabled}
                  onChange={(reps) => updateSetReps(Number(reps), set.id)}
                  placeholder="Reps"
                  inputMode="numeric"
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
                    aria-label={
                      canDeleteSet
                        ? "Remove set"
                        : "Can't remove the only set; remove the exercise instead"
                    }
                    disabled={!canDeleteSet}
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
            size="sm"
            className="self-end mt-3"
            leftSection={<IconPlus size={16} />}
            disabled={!sets}
            onClick={() => addActiveSet()}
          >
            Set
          </Button>
        </>
      )}
    </Stack>
  );
}
