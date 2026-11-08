import {
  Button,
  Card,
  Divider,
  Modal,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure, useToggle } from "@mantine/hooks";
import { IconEdit, IconEditOff, IconPlus } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Fragment, useState } from "react";
import { ExerciseCreator } from "../../components/exercise/ExerciseCreator";
import { ExerciseEditor } from "../../components/workoutSession/ExerciseEditor";
import { PageLayout } from "../../components/shared/PageLayout";
import { SessionSkeleton } from "../../components/workoutSession/SessionSkeleton";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import {
  useCustomExercises,
  type CustomExerciseDraft,
} from "../../hooks/exercise/useCustomExercises";
import { useExercise } from "../../hooks/workoutSession/useExercise";
import {
  previousPerformanceKey,
  usePreviousPerformance,
} from "../../hooks/workoutSession/usePreviousPerformance";
import { db, exerciseKindOf } from "../../store/db";
import { formatDateTime } from "../../utils/dates";

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const { addExercise, deleteExercise } = useExercise();
  const [activeExerciseId, setActiveExerciseId] = useState<number | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const { customExercises, addCustomExercise } = useCustomExercises();
  const [sessionMode, toggleSessionMode] = useToggle([
    "default",
    "edit",
  ] as const);

  const numericSessionId = Number(sessionId);
  const sessionEditable = sessionMode === "edit";

  const onEditExercise = (id: number) => {
    setActiveExerciseId(id);
  };

  const handleSelectExercise = async (exercise: LibraryExercise) => {
    await addExercise(
      { name: exercise.name, kind: exercise.kind },
      numericSessionId,
    );
    close();
  };

  const handleCreateCustomExercise = async (draft: CustomExerciseDraft) => {
    await addCustomExercise(draft);
    await addExercise(
      { name: draft.name, kind: exerciseKindOf(draft) },
      numericSessionId,
    );
    close();
  };

  const session = useLiveQuery(
    () => db.workoutSessions.get(numericSessionId),
    [numericSessionId],
  );

  const exerciseLogs = useLiveQuery(async () => {
    if (!numericSessionId) {
      return [];
    }

    return await db.exerciseLogs
      .where("sessionId")
      .equals(numericSessionId)
      .toArray();
  }, [numericSessionId]);

  const previousPerformance = usePreviousPerformance(session, exerciseLogs);

  // Also wait for the previous-performance hints, so they don't pop in and
  // push the sets down after the page has rendered.
  if (!session || !exerciseLogs || !previousPerformance) {
    return (
      <PageLayout action={<Skeleton height={36} width={80} radius="md" />}>
        <SessionSkeleton />
      </PageLayout>
    );
  }

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
          <div className="text-left">
            <Title order={3}>{session.name}</Title>
            <Text size="sm" c="dimmed">
              {formatDateTime(session.date)}
            </Text>
          </div>

          <Divider />

          {exerciseLogs.map((exercise, index) => (
            <Fragment key={exercise.id}>
              {index > 0 && <Divider />}
              <ExerciseEditor
                exerciseLog={exercise}
                previous={previousPerformance.get(
                  previousPerformanceKey(exercise),
                )}
                sessionId={numericSessionId}
                editable={activeExerciseId === exercise.id}
                sessionEditable={sessionEditable}
                onEditExercise={onEditExercise}
                onDeleteExercise={deleteExercise}
              />
            </Fragment>
          ))}

          {sessionEditable && (
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
      </Card>
    </PageLayout>
  );
}
