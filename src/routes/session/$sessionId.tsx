import { Button, Loader, Modal, Stack, TextInput, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useRef, useState } from "react";
import { ExerciseEditor } from "../../components/ExerciseEditor";
import { db } from "../../store/db";
import { useCreateExercise } from "../../hooks/useCreateExercise";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const [activeExerciseId, setActiveExerciseId] = useState<number | null>(null);
  const numericSessionId = Number(sessionId);

  const onEditExercise = (id: number) => {
    setActiveExerciseId(id);
  };

  const { addNewExerciseToSession } = useCreateExercise();
  const [opened, { open, close }] = useDisclosure(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex flex-col items-center">
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

      <div className="max-w-110 w-full text-left mt-4">
        <Button
          size="sm"
          variant="outline"
          className=""
          leftSection={<IconPlus />}
          onClick={open}
        >
          Bonus
        </Button>
      </div>

      {exerciseLogs.map((exercise) => (
        <ExerciseEditor
          key={exercise.id}
          exerciseLog={exercise}
          sessionId={numericSessionId}
          editable={activeExerciseId === exercise.id}
          onEditExercise={onEditExercise}
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
              addNewExerciseToSession(
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
