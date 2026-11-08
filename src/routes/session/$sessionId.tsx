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
} from "@mantine/core";
import { useDisclosure, useToggle } from "@mantine/hooks";
import {
  IconDeviceFloppy,
  IconEdit,
  IconEditOff,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Fragment, useState } from "react";
import { ExerciseCreator } from "../../components/exercise/ExerciseCreator";
import { DeleteSessionModal } from "../../components/workoutSession/DeleteSessionModal";
import { ExerciseEditor } from "../../components/workoutSession/ExerciseEditor";
import { PageLayout } from "../../components/shared/PageLayout";
import { SaveAsTemplateModal } from "../../components/workoutSession/SaveAsTemplateModal";
import { SessionNotFound } from "../../components/workoutSession/SessionNotFound";
import { SessionSkeleton } from "../../components/workoutSession/SessionSkeleton";
import { useCustomExercises } from "../../hooks/exercise/useCustomExercises";
import { useExerciseLookup } from "../../hooks/exercise/useExerciseLookup";
import { useExercise } from "../../hooks/workoutSession/useExercise";
import {
  previousPerformanceKey,
  usePreviousPerformance,
} from "../../hooks/workoutSession/usePreviousPerformance";
import { useWorkoutSession } from "../../hooks/workoutSession/useWorkoutSession";
import { db } from "../../store/db";
import { formatDateTime } from "../../utils/dates";

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const numericSessionId = Number(sessionId);
  const [activeExerciseId, setActiveExerciseId] = useState<number | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const { deleteExercise, handleSelectExercise } = useExercise({
    sessionId: numericSessionId,
    onAdded: close,
  });
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
  } = useWorkoutSession(numericSessionId);
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
      <PageLayout title="Session not found">
        <SessionNotFound />
      </PageLayout>
    );
  }

  // Also wait for the previous-performance hints, so they don't pop in and
  // push the sets down after the page has rendered.
  if (!session || !exerciseLogs || !previousPerformance) {
    return (
      <PageLayout action={<Skeleton height={36} width={80} radius="md" />}>
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

  const editToggle = (
    <Button
      variant={sessionEditable ? "filled" : "default"}
      leftSection={
        sessionEditable ? <IconEditOff size={16} /> : <IconEdit size={16} />
      }
      onClick={() => toggleSessionMode()}
    >
      {sessionEditable ? "Done" : "Edit"}
    </Button>
  );

  return (
    <PageLayout
      title={session.name}
      subtitle={formatDateTime(session.date)}
      action={editToggle}
    >
      <Card>
        <Stack>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div className="min-w-0 text-left">
              <Title order={3}>{session.name}</Title>
              <Text size="sm" c="dimmed">
                {formatDateTime(session.date)}
              </Text>
            </div>
            <Group gap="xs" wrap="nowrap">
              {canSaveAsTemplate && (
                <Button
                  variant="default"
                  size="xs"
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={openSaveTemplate}
                >
                  Save as template
                </Button>
              )}
              {sessionEditable && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label="Delete session"
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
              No exercises yet. Add one to start logging.
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
              />
            </Fragment>
          ))}

          {canAddExercise && (
            <Button
              variant="light"
              leftSection={<IconPlus size={18} />}
              onClick={open}
            >
              Add exercise
            </Button>
          )}
        </Stack>

        <Modal
          centered
          size="lg"
          opened={opened}
          onClose={close}
          title="Add exercise to this session"
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

        <SaveAsTemplateModal
          opened={saveTemplateOpened}
          defaultName={session.name}
          exerciseLogs={exerciseLogs}
          onClose={closeSaveTemplate}
          onSave={saveAsTemplate}
        />
      </Card>
    </PageLayout>
  );
}
