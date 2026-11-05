import {
  Button,
  Card,
  Divider,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure, useToggle } from "@mantine/hooks";
import { IconEdit, IconEditOff, IconPlus } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Fragment, useState } from "react";
import { ExerciseCreator } from "../../components/ExerciseCreator";
import { ExerciseEditor } from "../../components/ExerciseEditor";
import { PageLayout } from "../../components/PageLayout";
import { type LibraryExercise } from "../../data/exerciseCatalog";
import {
  useCustomExercises,
  type CustomExerciseDraft,
} from "../../hooks/useCustomExercises";
import { useExercise } from "../../hooks/useExercise";
import {
  previousPerformanceKey,
  usePreviousPerformance,
} from "../../hooks/usePreviousPerformance";
import { db, exerciseKindOf } from "../../store/db";

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionPage,
});

function formatSessionDate(date: string) {
  const value = new Date(date);
  const day = value.toLocaleString("lt-LT", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const time = value.toLocaleString("lt-LT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${day} · ${time}`;
}

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

  if (!session || !exerciseLogs) {
    return (
      <PageLayout title="Session" widthClassName="max-w-110">
        <Loader className="mx-auto" />
      </PageLayout>
    );
  }

  const editToggle = (
    <Button
      variant={sessionEditable ? "filled" : "outline"}
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
      subtitle={formatSessionDate(session.date)}
      action={editToggle}
      widthClassName="max-w-110"
    >
      <Card shadow="sm" padding="lg" className="w-full max-w-110 mx-auto">
        <Stack>
          <div className="text-left">
            <Title order={3}>{session.name}</Title>
            <Text size="sm" c="dimmed">
              {formatSessionDate(session.date)}
            </Text>
          </div>

          <Divider />

          {exerciseLogs.map((exercise, index) => (
            <Fragment key={exercise.id}>
              {index > 0 && <Divider />}
              <ExerciseEditor
                exerciseLog={exercise}
                previous={previousPerformance?.get(
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
              Add Exercise
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
