import { Paper, Text, Title } from "@mantine/core";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { RecentSessions } from "./RecentSessions";
import { SessionCalendar } from "./SessionCalendar";
import type { WorkoutSession } from "../store/db";

interface Props {
  /** All sessions, newest first. */
  sessions: WorkoutSession[];
  templateColorById: Map<number, string>;
}

const routeApi = getRouteApi("/");
const RECENT_SESSION_COUNT = 5;

/**
 * Session history for the home page: the calendar and the latest sessions.
 * Owns the `?month=` route-query logic that keeps the displayed month in the
 * URL (so going back from a session reopens the month it was launched from).
 * Side by side on tablets, stacked in the sidebar on desktop.
 */
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
        <Title order={4}>History</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Sessions you log will show up here and on the calendar.
        </Text>
      </Paper>
    );
  }

  return (
    <section
      aria-label="Session history"
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
