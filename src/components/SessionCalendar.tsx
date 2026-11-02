import { Indicator } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import dayjs from "dayjs";
import type { WorkoutSession } from "../store/db";

interface Props {
  sessions: WorkoutSession[];
  /** Currently displayed month in `YYYY-MM` format (controlled). */
  month: string;
  onSelectSession: (sessionId: number) => void;
  onMonthChange: (month: string) => void;
}

const DAY_FORMAT = "YYYY-MM-DD";
const MONTH_KEY_FORMAT = "YYYY-MM";
const MONTH_LABEL_FORMAT = "MMMM";

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

/** Collects the set of months (`YYYY-MM`) that contain at least one session. */
const collectSessionMonths = (sessions: WorkoutSession[]): Set<string> =>
  new Set(
    sessions.map((session) => dayjs(session.date).format(MONTH_KEY_FORMAT)),
  );

export function SessionCalendar({
  sessions,
  month,
  onSelectSession,
  onMonthChange,
}: Props) {
  const sessionsByDay = groupLatestSessionByDay(sessions);
  const sessionMonths = collectSessionMonths(sessions);

  return (
    <Calendar
      maxLevel="year"
      highlightToday
      enableKeyboardNavigation
      date={`${month}-01`}
      onDateChange={(dateString) =>
        onMonthChange(dayjs(dateString).format(MONTH_KEY_FORMAT))
      }
      styles={{
        levelsGroup: { display: "block" },
        calendarHeader: { maxWidth: "100%" },
        month: { width: "100%", height: 46, margin: "0 auto" },
        day: { width: "100%", height: 46, margin: "0 auto" },
        monthsList: { margin: "0 auto", width: "100%" },
        monthsListControl: { height: 64, margin: "0 auto" },
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
      getMonthControlProps={(dateString) => {
        const monthKey = dayjs(dateString).format(MONTH_KEY_FORMAT);
        const monthLabel = dayjs(dateString).format(MONTH_LABEL_FORMAT);
        const hasSessions = sessionMonths.has(monthKey);
        return {
          children: (
            <Indicator size={8} offset={-3} disabled={!hasSessions}>
              {monthLabel}
            </Indicator>
          ),
        };
      }}
      renderDay={(dateString) => {
        const session = sessionsByDay.get(dateString);
        const dayOfMonth = dayjs(dateString).date();
        return (
          <Indicator
            size={8}
            offset={-2}
            color={session?.indicatorColor}
            disabled={!session}
          >
            {dayOfMonth}
          </Indicator>
        );
      }}
    />
  );
}
