import type { CardioMetrics } from "../store/db";

/**
 * Copies only the cardio fields off a record (e.g. an `ExerciseLog`). The one
 * place that lists every metric: add new ones here and to `CardioMetrics`.
 */
export function pickCardioMetrics({
  durationMinutes,
  distanceKm,
  calories,
  avgHeartRate,
  rpe,
}: CardioMetrics): CardioMetrics {
  return { durationMinutes, distanceKm, calories, avgHeartRate, rpe };
}

/** True when at least one cardio value was entered. */
export function hasCardioMetrics(metrics: CardioMetrics): boolean {
  return Object.values(pickCardioMetrics(metrics)).some(
    (value) => (value ?? 0) > 0,
  );
}

/** Pace as "m:ss/km", or `null` when duration or distance is missing. */
export function formatPace({
  durationMinutes,
  distanceKm,
}: CardioMetrics): string | null {
  if (!durationMinutes || !distanceKm) {
    return null;
  }

  const secondsPerKm = Math.round((durationMinutes * 60) / distanceKm);
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = String(secondsPerKm % 60).padStart(2, "0");

  return `${minutes}:${seconds}/km`;
}

/**
 * One-line summary of the entered values, e.g.
 * "28 min · 4.76 km · 5:53/km · 320 kcal · 145 bpm · RPE 7".
 */
export function summarizeCardio(metrics: CardioMetrics): string {
  return [
    metrics.durationMinutes ? `${metrics.durationMinutes} min` : null,
    metrics.distanceKm ? `${metrics.distanceKm} km` : null,
    formatPace(metrics),
    metrics.calories ? `${metrics.calories} kcal` : null,
    metrics.avgHeartRate ? `${metrics.avgHeartRate} bpm` : null,
    metrics.rpe ? `RPE ${metrics.rpe}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
