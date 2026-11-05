import { Indicator } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import dayjs from "dayjs";
import type { WorkoutSession } from "../store/db";
import { sessionIndicatorColor } from "../utils/colors";

interface Props {
  sessions: WorkoutSession[];
  /** Current indicator color of each template, keyed by template id. */
  templateColorById: Map<number, string>;
  /** Currently displayed month in `YYYY-MM` format (controlled). */
  month: string;
  onSelectSession: (sessionId: number) => void;
  onMonthChange: (month: string) => void;
}

const DAY_FORMAT = "YYYY-MM-DD";
const MONTH_KEY_FORMAT = "YYYY-MM";
const MONTH_LABEL_FORMAT = "MMMM";

const byOldestDate = (a: WorkoutSession, b: WorkoutSession) =>
  dayjs(a.date).valueOf() - dayjs(b.date).valueOf();

/**
 * Indexes sessions by calendar day. When a day has more than one session, the
 * most recent one wins — that's where selecting the day navigates. (Sessions
 * are fed oldest → newest, so later entries overwrite earlier ones.)
 */
const groupLatestSessionByDay = (
  sessions: WorkoutSession[],
): Map<string, WorkoutSession> =>
  new Map(
    [...sessions]
      .sort(byOldestDate)
      .map((session) => [dayjs(session.date).format(DAY_FORMAT), session]),
  );

/** Collects the set of months (`YYYY-MM`) that contain at least one session. */
const collectSessionMonths = (sessions: WorkoutSession[]): Set<string> =>
  new Set(
    sessions.map((session) => dayjs(session.date).format(MONTH_KEY_FORMAT)),
  );

export function SessionCalendar({
  sessions,
  templateColorById,
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
        month: { width: "100%", margin: "0 auto" },
        day: { width: "100%", height: 42, margin: "0 auto" },
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
            color={
              session
                ? sessionIndicatorColor(session, templateColorById)
                : undefined
            }
            disabled={!session}
          >
            {dayOfMonth}
          </Indicator>
        );
      }}
    />
  );
}
