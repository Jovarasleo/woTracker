import { Indicator } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import dayjs from "dayjs";
import type { WorkoutSession } from "../store/db";

interface Props {
  sessions: WorkoutSession[];
  onSelectSession: (sessionId: number) => void;
}

const DAY_FORMAT = "YYYY-MM-DD";

/**
 * Indexes sessions by calendar day. When a day has more than one session, the
 * most recent one wins — that's where selecting the day navigates.
 */
const groupLatestSessionByDay = (
  sessions: WorkoutSession[],
): Map<string, WorkoutSession> =>
  sessions.reduce((sessionsByDay, session) => {
    const sessionDate = dayjs(session.date);
    const dayKey = sessionDate.format(DAY_FORMAT);

    const existingSession = sessionsByDay.get(dayKey);
    const sessionTime = sessionDate.valueOf();
    const existingTime = existingSession
      ? dayjs(existingSession.date).valueOf()
      : -Infinity;

    if (sessionTime > existingTime) {
      sessionsByDay.set(dayKey, session);
    }

    return sessionsByDay;
  }, new Map<string, WorkoutSession>());

export function SessionCalendar({ sessions, onSelectSession }: Props) {
  const sessionsByDay = groupLatestSessionByDay(sessions);

  return (
    <Calendar
      size="md"
      className="w-full"
      styles={{
        levelsGroup: { width: "100%" },
        calendarHeader: { maxWidth: "100%" },
        month: { width: "100%" },
        monthCell: { textAlign: "center" },
        day: { width: "100%", height: 46, margin: "0 auto" },
      }}
      getDayProps={(dateString) => {
        const session = sessionsByDay.get(dateString);
        return {
          disabled: !session,
          onClick: () => {
            if (session) {
              onSelectSession(session.id);
            }
          },
        };
      }}
      renderDay={(dateString) => {
        const session = sessionsByDay.get(dateString);
        const dayOfMonth = dayjs(dateString).date();
        return (
          <Indicator
            size={8}
            offset={-2}
            color={session?.indicatorColor ?? "transparent"}
            disabled={!session}
          >
            {dayOfMonth}
          </Indicator>
        );
      }}
    />
  );
}
