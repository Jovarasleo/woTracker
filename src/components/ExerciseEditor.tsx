import { Button, Group, NumberInput, Stack, Title } from "@mantine/core";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type ExerciseTemplate } from "../store/db";

export function ExerciseEditor({
  exercise,
  sessionId,
}: {
  exercise: ExerciseTemplate;
  sessionId: number;
}) {
  const exerciseLog = useLiveQuery(
    () =>
      db.exerciseLogs
        .where({ sessionId, exerciseTemplateId: exercise.id! })
        .first(),
    [sessionId, exercise.id],
  );

  const sets = useLiveQuery(
    () =>
      exerciseLog
        ? db.setLogs
            .where("exerciseLogId")
            .equals(exerciseLog.id!)
            .sortBy("setNumber")
        : [],
    [exerciseLog?.id],
  );

  const addSet = async () => {
    if (!exerciseLog) {
      const id = await db.exerciseLogs.add({
        sessionId,
        exerciseTemplateId: exercise.id!,
      });

      await db.setLogs.add({
        exerciseLogId: id,
        weight: 0,
        reps: 0,
        setNumber: 1,
      });
    } else {
      const setNumber = (sets?.length ?? 0) + 1;
      await db.setLogs.add({
        exerciseLogId: exerciseLog.id!,
        weight: 0,
        reps: 0,
        setNumber,
      });
    }
  };

  if (!exerciseLog && !sets) return <div>Loading...</div>;

  return (
    <Stack>
      <Title order={4}>{exercise.name}</Title>

      <Group>
        {(sets ?? []).map((set) => (
          <Group key={set.id}>
            <NumberInput
              value={set.weight}
              onChange={async (v) => {
                if (!v || !set.id) return;
                await db.setLogs.update(set.id, { weight: Number(v) });
              }}
              placeholder="Weight"
            />
            <NumberInput
              value={set.reps}
              onChange={async (v) => {
                if (!v || !set.id) return;
                await db.setLogs.update(set.id, { reps: Number(v) });
              }}
              placeholder="Reps"
            />
          </Group>
        ))}

        <Button onClick={addSet}>Add Set</Button>
      </Group>
    </Stack>
  );
}
