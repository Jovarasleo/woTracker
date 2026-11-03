import {
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure, useToggle } from "@mantine/hooks";
import { IconEdit, IconEditOff, IconPlus } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Fragment, useRef, useState } from "react";
import { ExerciseEditor } from "../../components/ExerciseEditor";
import { useExercise } from "../../hooks/useExercise";
import { db } from "../../store/db";

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

  const handleAddExercise = () => {
    addExercise(inputRef.current?.value ?? "Unnamed", numericSessionId);
    close();
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

  if (!session || !exerciseLogs) {
    return <Loader />;
  }

  return (
    <Card shadow="sm" padding="lg" className="w-full max-w-110 mx-auto">
      <Stack>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div className="text-left">
            <Title order={3}>{session.name}</Title>
            <Text size="sm" c="dimmed">
              {formatSessionDate(session.date)}
            </Text>
          </div>
          <Button
            size="xs"
            variant={sessionEditable ? "filled" : "outline"}
            leftSection={
              sessionEditable ? (
                <IconEditOff size={16} />
              ) : (
                <IconEdit size={16} />
              )
            }
            onClick={() => toggleSessionMode()}
          >
            {sessionEditable ? "Done" : "Edit"}
          </Button>
        </Group>

        <Divider />

        {exerciseLogs.map((exercise, index) => (
          <Fragment key={exercise.id}>
            {index > 0 && <Divider />}
            <ExerciseEditor
              exerciseLog={exercise}
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
        opened={opened}
        onClose={close}
        title="Add exercise to this session"
      >
        <Stack>
          <TextInput ref={inputRef} label="Exercise name" />
          <Group justify="flex-end">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleAddExercise}>Add</Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}
