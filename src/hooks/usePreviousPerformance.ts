import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  exerciseKindOf,
  type CardioMetrics,
  type ExerciseKind,
  type ExerciseLog,
  type SetLog,
  type WorkoutSession,
} from "../store/db";
import { hasCardioMetrics, pickCardioMetrics } from "../utils/cardio";

/** What was logged the last time an exercise was done. */
export type PreviousPerformance = {
  /** Date of the session it was logged in. */
  date: string;
} & (
  | { kind: "strength"; sets: SetLog[] }
  | { kind: "cardio"; metrics: CardioMetrics }
);

/**
 * Identifies "the same exercise" across sessions: same type and same name,
 * ignoring case and surrounding spaces.
 */
export function previousPerformanceKey(exercise: {
  name: string;
  kind?: ExerciseKind;
}) {
  return `${exerciseKindOf(exercise)}:${exercise.name.trim().toLowerCase()}`;
}

const isFilledSet = (set: SetLog) => set.weight > 0 || set.reps > 0;

const byDate = (a: { date: string }, b: { date: string }) =>
  new Date(a.date).getTime() - new Date(b.date).getTime();

/**
 * For every exercise in `session`, finds what was logged the most recent time
 * before it that the same exercise (see `previousPerformanceKey`) was done:
 * filled-in sets for strength, entered metrics for cardio. Look results up with
 * `previousPerformanceKey(exerciseLog)`. `undefined` while loading.
 */
export function usePreviousPerformance(
  session: WorkoutSession | undefined,
  exerciseLogs: ExerciseLog[] | undefined,
) {
  const sessionId = session?.id;
  const sessionDate = session?.date;
  // Primitive deps: the logs array is a new object whenever any value in the
  // session changes (e.g. every cardio keystroke), but only names matter here.
  const names = [
    ...new Set((exerciseLogs ?? []).map((log) => log.name)),
  ].sort();
  const namesKey = names.join("\n");

  return useLiveQuery(async () => {
    if (sessionId == null || !sessionDate || !names.length) {
      return new Map<string, PreviousPerformance>();
    }

    const sessionTime = new Date(sessionDate).getTime();
    const namedLogs = await db.exerciseLogs
      .where("name")
      .anyOfIgnoreCase(names)
      .filter((log) => log.sessionId !== sessionId)
      .toArray();

    const sessions = await db.workoutSessions.bulkGet([
      ...new Set(namedLogs.map((log) => log.sessionId)),
    ]);
    const earlierSessionDateById = new Map(
      sessions.flatMap((candidate) =>
        candidate && new Date(candidate.date).getTime() < sessionTime
          ? [[candidate.id, candidate.date] as const]
          : [],
      ),
    );

    // Only exercises from earlier sessions are candidates.
    const candidates = namedLogs.flatMap((log) => {
      const date = earlierSessionDateById.get(log.sessionId);
      return date ? [{ log, date }] : [];
    });

    const strengthSets = await db.setLogs
      .where("exerciseLogId")
      .anyOf(
        candidates
          .filter(({ log }) => exerciseKindOf(log) === "strength")
          .map(({ log }) => log.id),
      )
      .filter(isFilledSet)
      .sortBy("setNumber");

    const toPerformance = (
      log: ExerciseLog,
      date: string,
    ): PreviousPerformance | null => {
      if (exerciseKindOf(log) === "cardio") {
        return hasCardioMetrics(log)
          ? { date, kind: "cardio", metrics: pickCardioMetrics(log) }
          : null;
      }

      const sets = strengthSets.filter((set) => set.exerciseLogId === log.id);
      return sets.length ? { date, kind: "strength", sets } : null;
    };

    // Oldest → newest, so later entries overwrite earlier ones and each
    // exercise ends up with its most recent performance.
    return new Map(
      [...candidates].sort(byDate).flatMap(({ log, date }) => {
        const performance = toPerformance(log, date);
        return performance
          ? [[previousPerformanceKey(log), performance] as const]
          : [];
      }),
    );
    // `names` is derived from `namesKey`, which is the stable dependency.
  }, [sessionId, sessionDate, namesKey]);
}
