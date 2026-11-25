import dayjs, { type Dayjs } from "dayjs";
import { type WorkoutSession } from "../store/db";

// Also keeps sessions from before `finishedAt` existed from counting as active.
const ACTIVE_SESSION_HOURS = 6;

export const isWithinActiveWindow = (session: WorkoutSession, now: Dayjs) =>
  now.diff(session.date, "hour", true) < ACTIVE_SESSION_HOURS;

export const isSessionActive = (session: WorkoutSession, now: Dayjs) =>
  !session.finishedAt && isWithinActiveWindow(session, now);

export const minutesBetween = (start: string, end: Dayjs | string) =>
  Math.max(0, dayjs(end).diff(start, "minute"));

/**
 * A "HH:mm" finish time on the start's day, or the next day when it's earlier
 * than the start (a workout that ran past midnight).
 */
export const finishTimeFrom = (session: WorkoutSession, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const start = dayjs(session.date);
  const sameDay = start.hour(hours).minute(minutes).startOf("minute");

  return sameDay.isBefore(start, "minute") ? sameDay.add(1, "day") : sameDay;
};

export const workoutMinutes = (session: WorkoutSession, end: Dayjs | string) =>
  Math.max(0, minutesBetween(session.date, end) - (session.pausedMinutes ?? 0));
