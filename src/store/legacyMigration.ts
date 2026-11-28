import { newId } from "../utils/ids";
import type {
  CardioMetrics,
  ExerciseKind,
  WorkoutSession,
  SessionExercise,
  SessionSet,
  WorkoutTemplate,
  TemplateExercise,
  UserExercise,
} from "./db";

// Frozen copies of the v9 row shapes. They describe data that already exists,
// so they must not follow later changes to the interfaces in db.ts.
export interface LegacyWorkoutTemplate {
  id: number;
  name: string;
  createdAt: string;
  indicatorColor: string;
}

export interface LegacyExerciseTemplate {
  id: number;
  workoutTemplateId: number;
  name: string;
  order?: number;
  kind?: ExerciseKind;
}

export interface LegacyWorkoutSession {
  id: number;
  name: string;
  date: string;
  notes?: string;
  workoutTemplateId?: number;
  indicatorColor: string;
  finishedAt?: string;
  pausedMinutes?: number;
}

export interface LegacyExerciseLog extends CardioMetrics {
  id: number;
  sessionId: number;
  name: string;
  order?: number;
  exerciseTemplateId?: number;
  kind?: ExerciseKind;
}

export interface LegacySetLog {
  id: number;
  exerciseLogId: number;
  weight: number;
  reps: number;
  setNumber: number;
}

export interface LegacyCustomExercise {
  id: number;
  name: string;
  description?: string;
  primaryMuscle?: string;
  equipment?: string;
  kind?: ExerciseKind;
  createdAt: string;
}

export interface LegacyTables {
  workoutTemplates: LegacyWorkoutTemplate[];
  exerciseTemplates: LegacyExerciseTemplate[];
  workoutSessions: LegacyWorkoutSession[];
  exerciseLogs: LegacyExerciseLog[];
  setLogs: LegacySetLog[];
  customExercises: LegacyCustomExercise[];
}

export interface MigratedTables {
  templates: WorkoutTemplate[];
  templateExercises: TemplateExercise[];
  sessions: WorkoutSession[];
  sessionExercises: SessionExercise[];
  sessionSets: SessionSet[];
  userExercises: UserExercise[];
}

interface LegacyRow {
  id: number;
}

function newIdsFor(rows: LegacyRow[]) {
  return new Map(rows.map((row) => [row.id, newId()]));
}

function idFrom(ids: Map<number, string>, legacyId: number) {
  const id = ids.get(legacyId);
  if (id === undefined) {
    throw new Error(`No new id for legacy row ${legacyId}`);
  }

  return id;
}

function optionalIdFrom(ids: Map<number, string>, legacyId?: number) {
  return legacyId == null ? undefined : ids.get(legacyId);
}

function byId(a: LegacyRow, b: LegacyRow) {
  return a.id - b.id;
}

function byOrderThenId(a: LegacyExerciseTemplate, b: LegacyExerciseTemplate) {
  return (
    (a.order ?? Infinity) - (b.order ?? Infinity) || byId(a, b)
  );
}

function withOrderWithinParent<T extends LegacyRow>(
  rows: T[],
  parentIdOf: (row: T) => number,
  compare: (a: T, b: T) => number,
) {
  const sorted = [...rows].sort(
    (a, b) => parentIdOf(a) - parentIdOf(b) || compare(a, b),
  );
  const firstIndexByParent = new Map(
    sorted.map((row, index) => [parentIdOf(row), index] as const).reverse(),
  );

  return sorted.map((row, index) => ({
    row,
    order: (index - (firstIndexByParent.get(parentIdOf(row)) ?? index)) * 1000,
  }));
}

export function remapLegacyTables(legacy: LegacyTables): MigratedTables {
  const templateIds = newIdsFor(legacy.workoutTemplates);
  const keptTemplateExercises = legacy.exerciseTemplates.filter((exercise) =>
    templateIds.has(exercise.workoutTemplateId),
  );
  const templateExerciseIds = newIdsFor(keptTemplateExercises);
  const sessionIds = newIdsFor(legacy.workoutSessions);
  const keptSessionExercises = legacy.exerciseLogs.filter((log) =>
    sessionIds.has(log.sessionId),
  );
  const sessionExerciseIds = newIdsFor(keptSessionExercises);

  return {
    templates: legacy.workoutTemplates.map(({ id, ...template }) => ({
      ...template,
      id: idFrom(templateIds, id),
    })),
    templateExercises: withOrderWithinParent(
      keptTemplateExercises,
      (exercise) => exercise.workoutTemplateId,
      byOrderThenId,
    ).map(({ row: { id, workoutTemplateId, ...exercise }, order }) => ({
      ...exercise,
      id: idFrom(templateExerciseIds, id),
      templateId: idFrom(templateIds, workoutTemplateId),
      order,
    })),
    sessions: legacy.workoutSessions.map(
      ({ id, workoutTemplateId, ...session }) => ({
        ...session,
        id: idFrom(sessionIds, id),
        templateId: optionalIdFrom(templateIds, workoutTemplateId),
      }),
    ),
    // The session page lists exercises in id order (it never sorted by
    // `order`), so id order is the one users have seen.
    sessionExercises: withOrderWithinParent(
      keptSessionExercises,
      (log) => log.sessionId,
      byId,
    ).map(
      ({ row: { id, sessionId, exerciseTemplateId, ...log }, order }) => ({
        ...log,
        id: idFrom(sessionExerciseIds, id),
        sessionId: idFrom(sessionIds, sessionId),
        templateExerciseId: optionalIdFrom(
          templateExerciseIds,
          exerciseTemplateId,
        ),
        order,
      }),
    ),
    sessionSets: legacy.setLogs.flatMap(({ exerciseLogId, ...set }) => {
      const sessionExerciseId = sessionExerciseIds.get(exerciseLogId);
      if (sessionExerciseId === undefined) {
        return [];
      }

      return [{ ...set, id: newId(), sessionExerciseId }];
    }),
    userExercises: legacy.customExercises.map((exercise) => ({
      ...exercise,
      id: newId(),
    })),
  };
}
