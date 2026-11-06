import {
  Badge,
  Button,
  Card,
  ColorSwatch,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconPencil,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { CardioBadge } from "../../components/CardioBadge";
import { PageLayout } from "../../components/PageLayout";
import { useExercise } from "../../hooks/useExercise";
import { db, exerciseKindOf } from "../../store/db";
import { formatDate } from "../../utils/dates";

export const Route = createFileRoute("/workout/$templateId")({
  component: WorkoutPage,
});

function WorkoutPage() {
  const navigate = useNavigate();
  const { templateId } = Route.useParams();
  const numericTemplateId = Number(templateId);
  const { addExercise } = useExercise();
  const [starting, setStarting] = useState(false);

  const template = useLiveQuery(
    () => db.workoutTemplates.get(numericTemplateId),
    [numericTemplateId],
  );

  const exerciseTemplates = useLiveQuery(
    () =>
      db.exerciseTemplates
        .where("workoutTemplateId")
        .equals(numericTemplateId)
        .sortBy("order"),
    [numericTemplateId],
  );

  const sessions = useLiveQuery(
    () =>
      db.workoutSessions
        .where("workoutTemplateId")
        .equals(numericTemplateId)
        .toArray(),
    [numericTemplateId],
  );

  const startSession = async () => {
    // `starting` blocks a double tap from creating two sessions.
    if (!template || !exerciseTemplates || starting) {
      return;
    }

    setStarting(true);

    // One transaction, so a failure never leaves a half-built session.
    const newSessionId = await db
      .transaction(
        "rw",
        db.workoutSessions,
        db.exerciseLogs,
        db.setLogs,
        async () => {
          const sessionId = await db.workoutSessions.add({
            name: template.name,
            date: new Date().toISOString(),
            workoutTemplateId: template.id,
            indicatorColor: template.indicatorColor,
          });

          // One at a time, so each exercise gets the next `order` slot.
          for (const exerciseTemplate of exerciseTemplates) {
            await addExercise(
              {
                name: exerciseTemplate.name,
                kind: exerciseKindOf(exerciseTemplate),
                exerciseTemplateId: exerciseTemplate.id,
              },
              sessionId,
            );
          }

          return sessionId;
        },
      )
      .finally(() => setStarting(false));

    navigate({
      to: "/session/$sessionId",
      params: { sessionId: newSessionId.toString() },
      replace: true,
    });
  };

  if (!template || !exerciseTemplates || !sessions) {
    return (
      <PageLayout title="Workout">
        <div className="flex justify-center mt-10">
          <Loader />
        </div>
      </PageLayout>
    );
  }

  const lastSession = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];

  const exerciseCountLabel = `${exerciseTemplates.length} ${
    exerciseTemplates.length === 1 ? "exercise" : "exercises"
  }`;

  return (
    <PageLayout
      title={template.name}
      subtitle={exerciseCountLabel}
      action={
        <Button
          variant="default"
          leftSection={<IconPencil size={16} />}
          onClick={() =>
            navigate({
              to: "/workout/edit/$templateId",
              params: { templateId },
            })
          }
        >
          Edit
        </Button>
      }
    >
      <Stack gap="md">
        <Card>
          <Group gap="sm" align="center" wrap="nowrap">
            <ColorSwatch color={template.indicatorColor} size={32} />
            <div className="text-left">
              <Title order={2}>{template.name}</Title>
              <Text size="sm" c="dimmed">
                {exerciseCountLabel}
              </Text>
            </div>
          </Group>

          <Group gap="sm" mt="md" align="center">
            <IconCalendarEvent size={16} className="text-gray-400" />
            <Text size="sm" c="dimmed">
              {lastSession
                ? `Last performed ${formatDate(lastSession.date)}`
                : "Not performed yet"}
            </Text>
            {sessions.length > 0 && (
              <Badge variant="light" color={template.indicatorColor}>
                {sessions.length}{" "}
                {sessions.length === 1 ? "session" : "sessions"}
              </Badge>
            )}
          </Group>
        </Card>

        <Card padding="md">
          <Title order={4} mb="sm">
            Exercises
          </Title>
          <Stack gap={0}>
            {exerciseTemplates.map((exercise, index) => (
              <Group
                key={exercise.id}
                gap="sm"
                align="center"
                wrap="nowrap"
                className="py-2 border-b border-(--mantine-color-dark-4) last:border-b-0"
              >
                <Text
                  size="sm"
                  c="dimmed"
                  className="w-6 text-right tabular-nums"
                >
                  {index + 1}
                </Text>
                <Text fw={500}>{exercise.name}</Text>
                <CardioBadge kind={exerciseKindOf(exercise)} />
              </Group>
            ))}
          </Stack>
        </Card>

        <Button
          size="md"
          fullWidth
          color="green"
          leftSection={<IconPlayerPlayFilled size={18} />}
          loading={starting}
          onClick={startSession}
        >
          Start session
        </Button>
      </Stack>
    </PageLayout>
  );
}
