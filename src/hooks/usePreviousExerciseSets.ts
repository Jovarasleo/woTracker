import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  type ExerciseLog,
  type SetLog,
  type WorkoutSession,
} from "../store/db";

export interface PreviousPerformance {
  /** Date of the session the sets were logged in. */
  date: string;
  /** Sets with a weight or reps entered, in set order. */
  sets: SetLog[];
}

const nameKey = (name: string) => name.trim().toLowerCase();

const isFilledSet = (set: SetLog) => set.weight > 0 || set.reps > 0;

/**
 * For each exercise in `session`, finds the sets from the most recent earlier
 * session that logged an exercise with the same name (case-insensitive) and at
 * least one filled-in set. Returns a map keyed by the current exercise log id;
 * exercises without history have no entry. `undefined` while loading.
 */
export function usePreviousExerciseSets(
  session: WorkoutSession | undefined,
  exerciseLogs: ExerciseLog[] | undefined,
) {
  return useLiveQuery(async () => {
    if (!session || !exerciseLogs?.length) {
      return new Map<number, PreviousPerformance>();
    }

    const names = [...new Set(exerciseLogs.map((log) => log.name))];
    const candidateLogs = (
      await db.exerciseLogs.where("name").anyOfIgnoreCase(names).toArray()
    ).filter((log) => log.sessionId !== session.id);

    const candidateSessions = await db.workoutSessions.bulkGet([
      ...new Set(candidateLogs.map((log) => log.sessionId)),
    ]);
    const sessionDateById = new Map(
      candidateSessions.flatMap((candidate) =>
        candidate ? [[candidate.id, candidate.date] as const] : [],
      ),
    );

    const candidateSets = await db.setLogs
      .where("exerciseLogId")
      .anyOf(candidateLogs.map((log) => log.id))
      .sortBy("setNumber");

    const sessionTime = new Date(session.date).getTime();

    // Earlier sessions only, oldest → newest, so later entries overwrite
    // earlier ones and each name ends up with its most recent performance.
    const previousByName = new Map(
      candidateLogs
        .flatMap((log) => {
          const date = sessionDateById.get(log.sessionId);
          const sets = candidateSets.filter(
            (set) => set.exerciseLogId === log.id && isFilledSet(set),
          );

          if (!date || new Date(date).getTime() >= sessionTime) {
            return [];
          }

          return sets.length ? [{ name: log.name, date, sets }] : [];
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(
          ({ name, date, sets }) => [nameKey(name), { date, sets }] as const,
        ),
    );

    return new Map(
      exerciseLogs.flatMap((log) => {
        const previous = previousByName.get(nameKey(log.name));
        return previous ? [[log.id, previous] as const] : [];
      }),
    );
  }, [session, exerciseLogs]);
}
