import { useState } from "react";
import { Button, Card, NumberInput, Stack, Title } from "@mantine/core";
import { db } from "../store/db";

interface Props {
  templateId: number;
}

interface ExerciseWithSets {
  exerciseTemplateId: number;
  name: string;
  sets: { weight: number; reps: number }[];
}

export function StartWorkoutForm({ templateId }: Props) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithSets[]>([]);

  const initWorkout = async () => {
    const sessionId = await db.workoutSessions.add({
      workoutTemplateId: templateId,
      date: new Date().toISOString(),
    });

    if (!sessionId) throw new Error("Failed to create session");

    const templateExercises = await db.exerciseTemplates
      .where("templateId")
      .equals(templateId)
      .sortBy("order");

    const mapped = templateExercises.map((ex) => ({
      exerciseTemplateId: ex.id!,
      name: ex.name,
      sets: [],
    }));

    setSessionId(sessionId);
    setExercises(mapped);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ weight: 0, reps: 0 });
    setExercises(updated);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: number,
  ) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const saveWorkout = async () => {
    if (!sessionId) return;

    const logs = await db.exerciseLogs
      .where("sessionId")
      .equals(sessionId)
      .toArray();

    for (let i = 0; i < logs.length; i++) {
      const exercise = exercises[i];

      await db.setLogs.bulkAdd(
        exercise.sets.map((set, index) => ({
          exerciseLogId: logs[i].id!,
          weight: set.weight,
          reps: set.reps,
          setNumber: index + 1,
        })),
      );
    }
  };

  return (
    <Stack>
      {sessionId === null ? (
        <Button onClick={initWorkout}>Start Workout</Button>
      ) : (
        <>
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exerciseIndex} shadow="sm" padding="lg">
              <Stack>
                <Title order={4}>{exercise.name}</Title>

                {exercise.sets.map((set, setIndex) => (
                  <Stack key={setIndex}>
                    <NumberInput
                      label="Weight"
                      value={set.weight}
                      onChange={(value) =>
                        updateSet(
                          exerciseIndex,
                          setIndex,
                          "weight",
                          Number(value),
                        )
                      }
                    />
                    <NumberInput
                      label="Reps"
                      value={set.reps}
                      onChange={(value) =>
                        updateSet(
                          exerciseIndex,
                          setIndex,
                          "reps",
                          Number(value),
                        )
                      }
                    />
                  </Stack>
                ))}

                <Button variant="light" onClick={() => addSet(exerciseIndex)}>
                  Add Set
                </Button>
              </Stack>
            </Card>
          ))}

          <Button onClick={saveWorkout}>Finish Workout</Button>
        </>
      )}
    </Stack>
  );
}
