import dayjs, { type Dayjs } from "dayjs";
import type { WorkoutSession } from "../store/db";

export interface SessionStats {
  thisWeek: number;
  thisMonth: number;
  total: number;
  /** Consecutive weeks (Mon–Sun) with at least one session. */
  weekStreak: number;
  /** Mon–Sun flags for the current week: did a session happen that day? */
  weekDays: boolean[];
}

/** Monday 00:00 of the week containing `date`. */
export function startOfIsoWeek(date: Dayjs): Dayjs {
  const daysSinceMonday = (date.day() + 6) % 7;
  return date.subtract(daysSinceMonday, "day").startOf("day");
}

const weekKey = (date: Dayjs) => startOfIsoWeek(date).format("YYYY-MM-DD");

/**
 * Counts consecutive training weeks ending this week. The current week only
 * breaks the streak once it is over, so an empty week-so-far still counts the
 * weeks before it.
 */
function countWeekStreak(sessions: WorkoutSession[], now: Dayjs): number {
  const weeksWithSessions = new Set(
    sessions.map((session) => weekKey(dayjs(session.date))),
  );

  let week = startOfIsoWeek(now);
  if (!weeksWithSessions.has(week.format("YYYY-MM-DD"))) {
    week = week.subtract(1, "week");
  }

  let streak = 0;
  while (weeksWithSessions.has(week.format("YYYY-MM-DD"))) {
    streak += 1;
    week = week.subtract(1, "week");
  }
  return streak;
}

export function computeSessionStats(
  sessions: WorkoutSession[],
  now: Dayjs = dayjs(),
): SessionStats {
  const weekStart = startOfIsoWeek(now);
  const monthStart = now.startOf("month");
  const weekDays = Array.from({ length: 7 }, () => false);

  let thisWeek = 0;
  let thisMonth = 0;

  for (const session of sessions) {
    const date = dayjs(session.date);
    if (!date.isBefore(weekStart)) {
      thisWeek += 1;
      weekDays[(date.day() + 6) % 7] = true;
    }

    if (!date.isBefore(monthStart)) {
      thisMonth += 1;
    }
  }

  return {
    thisWeek,
    thisMonth,
    total: sessions.length,
    weekStreak: countWeekStreak(sessions, now),
    weekDays,
  };
}

/** Short human label for how long ago `date` was ("Today", "3 days ago"). */
export function formatRelativeDay(date: string, now: Dayjs = dayjs()): string {
  const days = now.startOf("day").diff(dayjs(date).startOf("day"), "day");

  if (days <= 0) {
    return "Today";
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  if (days < 14) {
    return "Last week";
  }

  if (days < 30) {
    return `${Math.floor(days / 7)} weeks ago`;
  }

  return dayjs(date).format("MMM D, YYYY");
}

/** Time-of-day greeting for the home header. */
export function greetingFor(now: Dayjs = dayjs()): string {
  const hour = now.hour();
  if (hour < 5) {
    return "Late night session?";
  }

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}
