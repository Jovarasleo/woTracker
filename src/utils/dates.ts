import dayjs, { type Dayjs } from "dayjs";

/**
 * The app's date formats — use these instead of ad-hoc `format()` /
 * `toLocaleString()` calls so dates read the same everywhere. The year is only
 * shown when it isn't the current one.
 */

const isThisYear = (date: Dayjs) => date.year() === dayjs().year();

/** "Oct 30" (this year) or "Oct 30, 2025". */
export function formatDate(date: string): string {
  const value = dayjs(date);
  return value.format(isThisYear(value) ? "MMM D" : "MMM D, YYYY");
}

/** "Thu, Nov 6 · 21:04" (this year) or "Thu, Nov 6, 2025 · 21:04". */
export function formatDateTime(date: string): string {
  const value = dayjs(date);
  return value.format(
    isThisYear(value) ? "ddd, MMM D · HH:mm" : "ddd, MMM D, YYYY · HH:mm",
  );
}

/** "Thursday, November 6, 2026" — for tooltips and confirmations. */
export function formatFullDate(date: string): string {
  return dayjs(date).format("dddd, MMMM D, YYYY");
}
