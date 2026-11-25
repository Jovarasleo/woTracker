import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure, useToggle } from "@mantine/hooks";
import {
  IconDeviceFloppy,
  IconEdit,
  IconEditOff,
  IconFlag,
  IconPencil,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import { Fragment, useState } from "react";
import { ExerciseCreator } from "../../components/exercise/ExerciseCreator";
import { DeleteSessionModal } from "../../components/workoutSession/DeleteSessionModal";
import { ExerciseEditor } from "../../components/workoutSession/ExerciseEditor";
import { FinishTimeModal } from "../../components/workoutSession/FinishTimeModal";
import { PageLayout } from "../../components/shared/PageLayout";
import { RestTimerButton } from "../../components/workoutSession/RestTimerButton";
import { SaveAsTemplateModal } from "../../components/workoutSession/SaveAsTemplateModal";
import { UndoNotifications } from "../../components/shared/UndoNotifications";
import { SessionNotFound } from "../../components/workoutSession/SessionNotFound";
import { SessionSkeleton } from "../../components/workoutSession/SessionSkeleton";
import { useCustomExercises } from "../../hooks/exercise/useCustomExercises";
import { useExerciseLookup } from "../../hooks/exercise/useExerciseLookup";
import { useUndo } from "../../hooks/shared/useUndo";
import { useExercise } from "../../hooks/workoutSession/useExercise";
import {
  previousPerformanceKey,
  usePreviousPerformance,
} from "../../hooks/workoutSession/usePreviousPerformance";
import { useRestTimer } from "../../hooks/workoutSession/useRestTimer";
import { useWorkoutSession } from "../../hooks/workoutSession/useWorkoutSession";
import { db } from "../../store/db";
import { formatDateTime } from "../../utils/dates";
import {
  isSessionActive,
  isWithinActiveWindow,
  workoutMinutes,
} from "../../utils/sessionStatus";
import { t } from "../../i18n/translations";

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const numericSessionId = Number(sessionId);
  const [activeExerciseId, setActiveExerciseId] = useState<number | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const { undoOffers, offerUndo, undo, dismissUndo } = useUndo();
  const { deleteExercise, handleSelectExercise } = useExercise({
    sessionId: numericSessionId,
    onAdded: close,
    onDeleted: offerUndo,
  });
  const { remainingSeconds, finished, startRest, addRest, stopRest } =
    useRestTimer();
  const { customExercises, handleCreateCustomExercise } = useCustomExercises({
    onCreated: handleSelectExercise,
  });
  const {
    deleteConfirmOpened,
    openDeleteConfirm,
    closeDeleteConfirm,
    deleting,
    confirmDelete,
    saveTemplateOpened,
    openSaveTemplate,
    closeSaveTemplate,
    saveAsTemplate,
    finishSession,
    resumeSession,
    finishTimeOpened,
    openFinishTime,
    closeFinishTime,
    saveFinishedAt,
  } = useWorkoutSession(numericSessionId, { onFinished: stopRest });
  const findExercise = useExerciseLookup();
  const [sessionMode, toggleSessionMode] = useToggle([
    "default",
    "edit",
  ] as const);

  const sessionEditable = sessionMode === "edit";

  const onEditExercise = (id: number) => {
    setActiveExerciseId(id);
  };

  // `null` once loaded if there is no such session (e.g. it was deleted), so
  // the page can say so instead of showing the skeleton forever.
  const session = useLiveQuery(async () => {
    if (!Number.isInteger(numericSessionId)) {
      return null;
    }

    return (await db.workoutSessions.get(numericSessionId)) ?? null;
  }, [numericSessionId]);

  const exerciseLogs = useLiveQuery(async () => {
    if (!numericSessionId) {
      return [];
    }

    return await db.exerciseLogs
      .where("sessionId")
      .equals(numericSessionId)
      .toArray();
  }, [numericSessionId]);

  const previousPerformance = usePreviousPerformance(
    session ?? undefined,
    exerciseLogs,
  );

  if (session === null) {
    return (
      <PageLayout title={t.session.notFoundTitle}>
        <SessionNotFound />
      </PageLayout>
    );
  }

  // Also wait for the previous-performance hints, so they don't pop in and
  // push the sets down after the page has rendered.
  if (!session || !exerciseLogs || !previousPerformance) {
    return (
      <PageLayout
        title={null}
        action={
          <Group gap="xs" wrap="nowrap">
            <Skeleton height={36} width={80} radius="md" />
            <Skeleton height={36} width={80} radius="md" />
          </Group>
        }
      >
        <SessionSkeleton />
      </PageLayout>
    );
  }

  // Quick workouts are started without a template and built up as you go, so
  // they always offer "Add exercise" and can be saved as a template.
  const isQuickWorkout = session.workoutTemplateId == null;
  const canSaveAsTemplate = isQuickWorkout && exerciseLogs.length > 0;
  const canAddExercise =
    sessionEditable || isQuickWorkout || exerciseLogs.length === 0;
  const now = dayjs();
  const canFinish = !sessionEditable && isSessionActive(session, now);
  const canResume =
    !sessionEditable &&
    session.finishedAt != null &&
    isWithinActiveWindow(session, now);

  const editToggle = (
    <Button
      variant={sessionEditable ? "filled" : "default"}
      leftSection={
        sessionEditable ? <IconEditOff size={16} /> : <IconEdit size={16} />
      }
      onClick={() => toggleSessionMode()}
    >
      {sessionEditable ? t.common.done : t.common.edit}
    </Button>
  );

  return (
    // No title in the bar: the card below starts with the name and date.
    <PageLayout
      title={null}
      action={
        <Group gap="xs" wrap="nowrap">
          <RestTimerButton
            remainingSeconds={remainingSeconds}
            finished={finished}
            onStart={startRest}
            onAdd={addRest}
            onStop={stopRest}
          />
          {editToggle}
        </Group>
      }
    >
      <Card>
        <Stack>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div className="min-w-0 text-left">
              <Title order={3}>{session.name}</Title>
              <Text size="sm" c="dimmed">
                {formatDateTime(session.date)}
              </Text>
              {session.finishedAt && (
                <UnstyledButton
                  onClick={openFinishTime}
                  className="flex items-center gap-1"
                >
                  <Text size="sm" c="dimmed">
                    {t.session.finishedAfter(
                      t.common.duration(
                        workoutMinutes(session, session.finishedAt),
                      ),
                    )}
                  </Text>
                  <IconPencil
                    size={14}
                    className="text-gray-500"
                    aria-label={t.session.editFinishTime}
                  />
                </UnstyledButton>
              )}
            </div>
            <Group gap="xs" wrap="nowrap">
              {canSaveAsTemplate && (
                <Button
                  variant="default"
                  size="xs"
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={openSaveTemplate}
                >
                  {t.session.saveAsTemplate}
                </Button>
              )}
              {sessionEditable && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label={t.session.deleteSession}
                  onClick={openDeleteConfirm}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              )}
            </Group>
          </Group>

          <Divider />

          {exerciseLogs.length === 0 && (
            <Text c="dimmed" className="text-left">
              {t.session.noExercises}
            </Text>
          )}

          {exerciseLogs.map((exercise, index) => (
            <Fragment key={exercise.id}>
              {index > 0 && <Divider />}
              <ExerciseEditor
                exerciseLog={exercise}
                previous={previousPerformance.get(
                  previousPerformanceKey(exercise),
                )}
                details={findExercise(exercise.name)}
                sessionId={numericSessionId}
                editable={activeExerciseId === exercise.id}
                sessionEditable={sessionEditable}
                onEditExercise={onEditExercise}
                onDeleteExercise={deleteExercise}
                onSetDeleted={offerUndo}
              />
            </Fragment>
          ))}

          {canAddExercise && (
            <Button
              variant="light"
              leftSection={<IconPlus size={18} />}
              onClick={open}
            >
              {t.common.addExercise}
            </Button>
          )}

          {canFinish && (
            <Button
              leftSection={<IconFlag size={18} />}
              onClick={() => finishSession()}
            >
              {t.session.finishWorkout}
            </Button>
          )}

          {canResume && (
            <Button
              variant="default"
              leftSection={<IconPlayerPlay size={18} />}
              onClick={() => resumeSession()}
            >
              {t.session.resumeWorkout}
            </Button>
          )}
        </Stack>

        <Modal
          centered
          size="lg"
          opened={opened}
          onClose={close}
          title={t.session.addExerciseTitle}
        >
          <ExerciseCreator
            customExercises={customExercises}
            onSelectExercise={handleSelectExercise}
            onCreateCustomExercise={handleCreateCustomExercise}
          />
        </Modal>

        <DeleteSessionModal
          session={session}
          opened={deleteConfirmOpened}
          deleting={deleting}
          onClose={closeDeleteConfirm}
          onConfirm={confirmDelete}
        />

        <FinishTimeModal
          session={session}
          opened={finishTimeOpened}
          onClose={closeFinishTime}
          onSave={saveFinishedAt}
        />

        <SaveAsTemplateModal
          opened={saveTemplateOpened}
          defaultName={session.name}
          exerciseLogs={exerciseLogs}
          onClose={closeSaveTemplate}
          onSave={saveAsTemplate}
        />

        <UndoNotifications
          offers={undoOffers}
          onUndo={undo}
          onDismiss={dismissUndo}
        />
      </Card>
    </PageLayout>
  );
}
