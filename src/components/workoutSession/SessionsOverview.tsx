import { Paper, Text, Title } from "@mantine/core";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { RecentSessions } from "./RecentSessions";
import { SessionCalendar } from "./SessionCalendar";
import type { WorkoutSession } from "../../store/db";
import { t } from "../../i18n/translations";

interface Props {
  /** All sessions, newest first. */
  sessions: WorkoutSession[];
  templateColorById: Map<number, string>;
}

const routeApi = getRouteApi("/");
const RECENT_SESSION_COUNT = 5;

/** Keeps the displayed month in `?month=`, so going back from a session reopens it. */
export function SessionsOverview({ sessions, templateColorById }: Props) {
  const navigate = useNavigate();
  const { month } = routeApi.useSearch();
  const displayedMonth = month ?? dayjs().format("YYYY-MM");

  const openSession = (sessionId: number) =>
    navigate({
      to: "/session/$sessionId",
      params: { sessionId: sessionId.toString() },
    });

  if (!sessions.length) {
    return (
      <Paper withBorder radius="lg" p="md">
        <Title order={4}>{t.sessionHistory.heading}</Title>
        <Text size="sm" c="dimmed" mt={4}>
          {t.sessionHistory.emptyText}
        </Text>
      </Paper>
    );
  }

  return (
    <section
      aria-label={t.sessionHistory.sectionLabel}
      className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 lg:grid-cols-1"
    >
      <Paper withBorder radius="lg" p="md">
        <SessionCalendar
          sessions={sessions}
          templateColorById={templateColorById}
          month={displayedMonth}
          onMonthChange={(newMonth) =>
            navigate({
              to: "/",
              search: (prev) => ({ ...prev, month: newMonth }),
              replace: true,
              resetScroll: false,
            })
          }
          onSelectSession={openSession}
        />
      </Paper>
      <RecentSessions
        sessions={sessions.slice(0, RECENT_SESSION_COUNT)}
        templateColorById={templateColorById}
        onSelectSession={openSession}
      />
    </section>
  );
}
