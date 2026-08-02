import { Button, Loader, Modal, Stack, TextInput, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useRef, useState } from "react";
import { ExerciseEditor } from "../../components/ExerciseEditor";
import { db } from "../../store/db";
import { useExercise } from "../../hooks/useExercise";
import { useDisclosure, useToggle } from "@mantine/hooks";
import { IconEdit, IconEditOff, IconPlus } from "@tabler/icons-react";

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const { addExercise, deleteExercise } = useExercise();
  const [activeExerciseId, setActiveExerciseId] = useState<number | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sessionMode, toggleSessionMode] = useToggle([
    "default",
    "edit",
  ] as const);

  const numericSessionId = Number(sessionId);
  const sessionEditable = sessionMode === "edit";

  const onEditExercise = (id: number) => {
    setActiveExerciseId(id);
  };

  const session = useLiveQuery(
    () => db.workoutSessions.get(numericSessionId),
    [numericSessionId],
  );

  const exerciseLogs = useLiveQuery(async () => {
    if (!numericSessionId) return [];

    return await db.exerciseLogs
      .where("sessionId")
      .equals(numericSessionId)
      .toArray();
  }, [numericSessionId]);

  if (!session || !exerciseLogs) return <Loader />;

  return (
    <div className="max-w-110 mx-auto">
      <Title order={2}>{`${session.name} session:  ${new Date(
        session.date,
      ).toLocaleString("lt-LT", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`}</Title>
      <div className="text-left my-4 flex justify-between">
        {sessionEditable && (
          <Button
            size="sm"
            variant="filled"
            color="cyan"
            leftSection={<IconPlus />}
            onClick={open}
          >
            Bonus
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          className="ms-auto"
          leftSection={sessionEditable ? <IconEditOff /> : <IconEdit />}
          onClick={() => toggleSessionMode()}
        >
          Edit Session
        </Button>
      </div>

      {exerciseLogs.map((exercise) => (
        <ExerciseEditor
          key={exercise.id}
          exerciseLog={exercise}
          sessionId={numericSessionId}
          editable={activeExerciseId === exercise.id}
          sessionEditable={sessionEditable}
          onEditExercise={onEditExercise}
          onDeleteExercise={deleteExercise}
        />
      ))}

      <Modal
        centered
        opened={opened}
        onClose={close}
        title="Add exercise to this session"
      >
        <Stack>
          <TextInput ref={inputRef} label="Exercise name" />
          <Button
            onClick={() => {
              addExercise(
                inputRef.current?.value ?? "Unnamed",
                numericSessionId,
              );

              close();
            }}
          >
            Add New
          </Button>
        </Stack>
      </Modal>
    </div>
  );
}
