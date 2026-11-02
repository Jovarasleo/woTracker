import { Box } from "@mantine/core";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import dayjs from "dayjs";
import { SessionCalendar } from "./SessionCalendar";
import { db } from "../store/db";

const routeApi = getRouteApi("/");

/**
 * Past-sessions calendar for the home page. Owns the session data query and the
 * `?month=` route-query logic that keeps the displayed month in the URL (so
 * going back from a session reopens the month it was launched from).
 */
export function SessionsOverview() {
  const navigate = useNavigate();
  const { month } = routeApi.useSearch();
  const displayedMonth = month ?? dayjs().format("YYYY-MM");

  const workoutSessions = useLiveQuery(
    async () =>
      (await db.workoutSessions.toArray()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [],
  );

  if (!workoutSessions?.length) return null;

  return (
    <Box className="mt-8 max-w-3xl mx-auto">
      <SessionCalendar
        sessions={workoutSessions}
        month={displayedMonth}
        onMonthChange={(newMonth) =>
          navigate({
            to: "/",
            search: (prev) => ({ ...prev, month: newMonth }),
            replace: true,
          })
        }
        onSelectSession={(sessionId) =>
          navigate({
            to: "/session/$sessionId",
            params: { sessionId: sessionId.toString() },
          })
        }
      />
    </Box>
  );
}
