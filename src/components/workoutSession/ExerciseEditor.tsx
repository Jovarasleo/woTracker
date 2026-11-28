import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Stack,
  Text,
} from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { IconCheck, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { type FocusEvent, type KeyboardEvent, useRef, useState } from "react";
import { CardioEditor } from "./CardioEditor";
import { PreviousPerformanceHint } from "./PreviousPerformanceHint";
import { SetRowSkeleton } from "./SetRowSkeleton";
import { type UndoAction } from "../../hooks/shared/useUndo";
import { useExerciseLogEditor } from "../../hooks/workoutSession/useExerciseLogEditor";
import { type PreviousPerformance } from "../../hooks/workoutSession/usePreviousPerformance";
import { ExerciseName } from "../exercise/ExerciseName";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import { exerciseKindOf, type SessionExercise } from "../../store/db";
import { t } from "../../i18n/translations";

const selectAll = (event: FocusEvent<HTMLInputElement>) =>
  event.currentTarget.select();

const focusOnAttach = (input: HTMLInputElement | null) => {
  input?.focus();
};

/**
 * Clears the selection and focus of an input inside `container` before it is
 * disabled; a disabled input that still has focus keeps its text highlighted.
 */
const releaseInput = (container: HTMLElement | null) => {
  const focused = document.activeElement;

  if (!(focused instanceof HTMLInputElement) || !container?.contains(focused)) {
    return;
  }

  focused.setSelectionRange(focused.value.length, focused.value.length);
  focused.blur();
};

/** While editing, show 0 as empty so clearing a field doesn't put 0 back. */
const showValue = (value: number, disabled: boolean) =>
  !disabled && value === 0 ? "" : value;

interface Props {
  exerciseLog: SessionExercise;
  sessionId: string;
  editable: boolean;
  sessionEditable: boolean;
  onEditExercise: (exerciseId: string) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onSetDeleted: (action: UndoAction) => void;
  previous?: PreviousPerformance;
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
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
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
  const cardioLocked = !cardioEditing || !editable;
  const editingSet = editable && activeSetId !== null;
  const addSetButtonRef = useRef<HTMLButtonElement>(null);
  const activeRepsRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const stopEditingSet = () => {
    releaseInput(editorRef.current);
    setActiveSetId(null);
  };

  const activeRowRef = useClickOutside<HTMLDivElement>(
    (event) => {
      // "+ Set" counts as inside: otherwise the tap that ends editing
      // re-enables the button before the click lands, and adds a set.
      if (addSetButtonRef.current?.contains(event.target as Node)) {
        return;
      }

      stopEditingSet();
    },
    null,
    undefined,
    editingSet,
  );

  const onSetEditable = (exerciseId: string, setId: string) => {
    if (setId === activeSetId) {
      stopEditingSet();
      return;
    }

    onEditExercise(exerciseId);
    setActiveSetId(setId);
  };

  const focusRepsOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    activeRepsRef.current?.focus();
  };

  const finishSetOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    stopEditingSet();
  };

  const onDeleteSet = (setId: string) => {
    if (setId === activeSetId) {
      stopEditingSet();
    }

    deleteSet(setId);
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
    <Stack ref={editorRef} gap="xs">
      <Group justify="space-between" wrap="nowrap" className="min-h-7 mb-2">
        <div className="min-w-0">
          <ExerciseName name={exerciseLog.name} details={details} fw={600} />
          {previous && <PreviousPerformanceHint previous={previous} />}
        </div>
        {sessionEditable && (
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label={t.common.removeExercise}
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
          {(!sets || sets.length > 0) && (
            <Group gap="xs" wrap="nowrap" className="-mb-1">
              <div className="w-5 shrink-0" />
              <Text size="sm" fw={500} className="flex-1 text-left">
                {t.sets.weight}
              </Text>
              <Text size="sm" fw={500} className="flex-1 text-left">
                {t.sets.reps}
              </Text>
              <div className="w-8.5 shrink-0" />
              {sessionEditable && <div className="w-8.5 shrink-0" />}
            </Group>
          )}

          {!sets && <SetRowSkeleton />}

          {sets?.map((set, index) => {
            const disabled = activeSetId !== set.id || !editable;

            return (
              <Group
                key={set.id}
                ref={disabled ? undefined : activeRowRef}
                gap="xs"
                wrap="nowrap"
                align="center"
              >
                <Text size="sm" c="dimmed" className="w-5 shrink-0">
                  {index + 1}
                </Text>
                <NumberInput
                  ref={disabled ? undefined : focusOnAttach}
                  className="flex-1"
                  value={showValue(set.weight, disabled)}
                  min={0}
                  disabled={disabled}
                  onFocus={selectAll}
                  onChange={(weight) => updateSetWeight(Number(weight), set.id)}
                  placeholder={t.sets.weight}
                  inputMode="decimal"
                  enterKeyHint="next"
                  onKeyDown={focusRepsOnEnter}
                />
                <NumberInput
                  ref={disabled ? undefined : activeRepsRef}
                  className="flex-1"
                  value={showValue(set.reps, disabled)}
                  min={0}
                  disabled={disabled}
                  onFocus={selectAll}
                  onChange={(reps) => updateSetReps(Number(reps), set.id)}
                  placeholder={t.sets.reps}
                  inputMode="numeric"
                  enterKeyHint="done"
                  onKeyDown={finishSetOnEnter}
                />
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  aria-label={disabled ? t.sets.editSet : t.sets.confirmSet}
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
                      canDeleteSet ? t.sets.removeSet : t.sets.cantRemoveOnlySet
                    }
                    disabled={!canDeleteSet}
                    onClick={() => onDeleteSet(set.id)}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                )}
              </Group>
            );
          })}

          <Button
            ref={addSetButtonRef}
            variant="light"
            size="sm"
            className="self-end mt-3"
            leftSection={<IconPlus size={16} />}
            disabled={!sets || editingSet}
            onClick={() => addActiveSet()}
          >
            {t.sets.addSet}
          </Button>
        </>
      )}
    </Stack>
  );
}
