import {
  Badge,
  Button,
  Card,
  ColorSwatch,
  Group,
  Skeleton,
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
import { CardioBadge } from "../../components/exercise/CardioBadge";
import { ExerciseName } from "../../components/exercise/ExerciseName";
import { PageLayout } from "../../components/shared/PageLayout";
import { WorkoutSkeleton } from "../../components/workoutTemplate/WorkoutSkeleton";
import { useExerciseLookup } from "../../hooks/exercise/useExerciseLookup";
import { useExercise } from "../../hooks/workoutSession/useExercise";
import { db, exerciseKindOf } from "../../store/db";
import { newId } from "../../utils/ids";
import { formatDate } from "../../utils/dates";
import { t } from "../../i18n/translations";

export const Route = createFileRoute("/workout/$templateId")({
  component: WorkoutPage,
});

function WorkoutPage() {
  const navigate = useNavigate();
  const { templateId } = Route.useParams();
  const { addExercise } = useExercise();
  const findExercise = useExerciseLookup();
  const [starting, setStarting] = useState(false);

  const template = useLiveQuery(
    () => db.templates.get(templateId),
    [templateId],
  );

  const exerciseTemplates = useLiveQuery(
    () =>
      db.templateExercises
        .where("templateId")
        .equals(templateId)
        .sortBy("order"),
    [templateId],
  );

  const sessions = useLiveQuery(
    () =>
      db.sessions
        .where("templateId")
        .equals(templateId)
        .toArray(),
    [templateId],
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
        db.sessions,
        db.sessionExercises,
        db.sessionSets,
        async () => {
          const sessionId = await db.sessions.add({
            id: newId(),
            name: template.name,
            date: new Date().toISOString(),
            templateId: template.id,
            indicatorColor: template.indicatorColor,
          });

          // One at a time, so each exercise gets the next `order` slot.
          for (const exerciseTemplate of exerciseTemplates) {
            await addExercise(
              {
                name: exerciseTemplate.name,
                kind: exerciseKindOf(exerciseTemplate),
                templateExerciseId: exerciseTemplate.id,
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
      params: { sessionId: newSessionId },
      replace: true,
    });
  };

  if (!template || !exerciseTemplates || !sessions) {
    return (
      <PageLayout action={<Skeleton height={36} width={80} radius="md" />}>
        <WorkoutSkeleton />
      </PageLayout>
    );
  }

  const lastSession = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];

  const exerciseCountLabel = t.common.exerciseCount(exerciseTemplates.length);

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
          {t.common.edit}
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
                ? t.workout.lastPerformed(formatDate(lastSession.date))
                : t.workout.notPerformedYet}
            </Text>
            {sessions.length > 0 && (
              <Badge variant="light" color={template.indicatorColor}>
                {t.workout.sessionCount(sessions.length)}
              </Badge>
            )}
          </Group>
        </Card>

        <Card padding="md">
          <Title order={4} mb="sm">
            {t.common.exercises}
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
                <ExerciseName
                  name={exercise.name}
                  details={findExercise(exercise.name)}
                  fw={500}
                />
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
          {t.workout.startSession}
        </Button>
      </Stack>
    </PageLayout>
  );
}
