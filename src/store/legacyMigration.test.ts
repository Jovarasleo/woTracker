import { describe, expect, it } from "vitest";
import { remapLegacyTables, type LegacyTables } from "./legacyMigration";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function legacyTables(tables: Partial<LegacyTables>): LegacyTables {
  return {
    workoutTemplates: [],
    exerciseTemplates: [],
    workoutSessions: [],
    exerciseLogs: [],
    setLogs: [],
    customExercises: [],
    ...tables,
  };
}

const pushTemplate = {
  id: 1,
  name: "Push",
  createdAt: "2026-01-01T10:00:00.000Z",
  indicatorColor: "#ff0000",
};

const pushSession = {
  id: 10,
  name: "Push",
  date: "2026-02-01T10:00:00.000Z",
  workoutTemplateId: 1,
  indicatorColor: "#ff0000",
  notes: "Felt strong",
  finishedAt: "2026-02-01T11:00:00.000Z",
  pausedMinutes: 5,
};

describe("remapLegacyTables", () => {
  it("returns empty tables for an empty database", () => {
    expect(remapLegacyTables(legacyTables({}))).toEqual({
      templates: [],
      templateExercises: [],
      sessions: [],
      sessionExercises: [],
      sessionSets: [],
      userExercises: [],
    });
  });

  it("gives every row a UUID and points references at the new ids", () => {
    const result = remapLegacyTables(
      legacyTables({
        workoutTemplates: [pushTemplate],
        exerciseTemplates: [
          { id: 2, workoutTemplateId: 1, name: "Bench press", order: 0 },
        ],
        workoutSessions: [pushSession],
        exerciseLogs: [
          { id: 20, sessionId: 10, name: "Bench press", exerciseTemplateId: 2 },
        ],
        setLogs: [
          { id: 30, exerciseLogId: 20, weight: 80, reps: 8, setNumber: 1 },
          { id: 31, exerciseLogId: 20, weight: 80, reps: 6, setNumber: 2 },
        ],
        customExercises: [
          { id: 40, name: "Sled push", createdAt: "2026-01-02T10:00:00.000Z" },
        ],
      }),
    );

    const [template] = result.templates;
    const [templateExercise] = result.templateExercises;
    const [session] = result.sessions;
    const [sessionExercise] = result.sessionExercises;

    const allIds = Object.values(result)
      .flat()
      .map((row) => row.id);
    expect(allIds).toHaveLength(7);
    expect(new Set(allIds).size).toBe(7);
    allIds.forEach((id) => expect(id).toMatch(UUID));

    expect(templateExercise.templateId).toBe(template.id);
    expect(session.templateId).toBe(template.id);
    expect(sessionExercise.sessionId).toBe(session.id);
    expect(sessionExercise.templateExerciseId).toBe(templateExercise.id);
    result.sessionSets.forEach((set) =>
      expect(set.sessionExerciseId).toBe(sessionExercise.id),
    );
  });

  it("keeps every other field and drops the old reference fields", () => {
    const result = remapLegacyTables(
      legacyTables({
        workoutTemplates: [pushTemplate],
        workoutSessions: [pushSession],
        exerciseLogs: [
          {
            id: 20,
            sessionId: 10,
            name: "Rowing",
            kind: "cardio",
            durationMinutes: 20,
            distanceKm: 5,
            calories: 300,
            avgHeartRate: 150,
            rpe: 7,
          },
        ],
        customExercises: [
          {
            id: 40,
            name: "Sled push",
            description: "Heavy sled",
            primaryMuscle: "quadriceps",
            equipment: "sled",
            kind: "strength",
            createdAt: "2026-01-02T10:00:00.000Z",
          },
        ],
      }),
    );

    expect(result.templates[0]).toEqual({
      ...pushTemplate,
      id: result.templates[0].id,
    });

    expect(result.sessions[0]).toEqual({
      id: result.sessions[0].id,
      name: "Push",
      date: "2026-02-01T10:00:00.000Z",
      templateId: result.templates[0].id,
      indicatorColor: "#ff0000",
      notes: "Felt strong",
      finishedAt: "2026-02-01T11:00:00.000Z",
      pausedMinutes: 5,
    });
    expect(result.sessions[0]).not.toHaveProperty("workoutTemplateId");

    expect(result.sessionExercises[0]).toMatchObject({
      name: "Rowing",
      kind: "cardio",
      durationMinutes: 20,
      distanceKm: 5,
      calories: 300,
      avgHeartRate: 150,
      rpe: 7,
    });
    expect(result.sessionExercises[0]).not.toHaveProperty(
      "exerciseTemplateId",
    );

    expect(result.userExercises[0]).toMatchObject({
      name: "Sled push",
      description: "Heavy sled",
      primaryMuscle: "quadriceps",
      equipment: "sled",
      kind: "strength",
      createdAt: "2026-01-02T10:00:00.000Z",
    });
  });

  it("clears references to templates and template exercises that no longer exist", () => {
    const result = remapLegacyTables(
      legacyTables({
        workoutSessions: [{ ...pushSession, workoutTemplateId: 99 }],
        exerciseLogs: [
          { id: 20, sessionId: 10, name: "Bench press", exerciseTemplateId: 98 },
        ],
      }),
    );

    expect(result.sessions[0].templateId).toBeUndefined();
    expect(result.sessionExercises[0].templateExerciseId).toBeUndefined();
  });

  it("drops rows whose parent is gone, including the children of dropped rows", () => {
    const result = remapLegacyTables(
      legacyTables({
        workoutTemplates: [pushTemplate],
        exerciseTemplates: [
          { id: 2, workoutTemplateId: 1, name: "Bench press", order: 0 },
          { id: 3, workoutTemplateId: 99, name: "Orphan", order: 0 },
        ],
        workoutSessions: [pushSession],
        exerciseLogs: [
          { id: 20, sessionId: 10, name: "Bench press", exerciseTemplateId: 3 },
          { id: 21, sessionId: 99, name: "Orphan log" },
        ],
        setLogs: [
          { id: 30, exerciseLogId: 20, weight: 80, reps: 8, setNumber: 1 },
          { id: 31, exerciseLogId: 21, weight: 50, reps: 5, setNumber: 1 },
          { id: 32, exerciseLogId: 99, weight: 50, reps: 5, setNumber: 1 },
        ],
      }),
    );

    expect(result.templateExercises.map((e) => e.name)).toEqual([
      "Bench press",
    ]);
    expect(result.sessionExercises.map((e) => e.name)).toEqual([
      "Bench press",
    ]);
    expect(result.sessionExercises[0].templateExerciseId).toBeUndefined();
    expect(result.sessionSets.map((set) => set.weight)).toEqual([80]);
  });

  it("numbers session exercises by old id within each session", () => {
    const result = remapLegacyTables(
      legacyTables({
        workoutSessions: [pushSession, { ...pushSession, id: 11 }],
        exerciseLogs: [
          { id: 22, sessionId: 10, name: "C", order: 0 },
          { id: 20, sessionId: 10, name: "A", order: 5000 },
          { id: 21, sessionId: 10, name: "B" },
          { id: 23, sessionId: 11, name: "D", order: 3000 },
        ],
      }),
    );

    const orderByName = Object.fromEntries(
      result.sessionExercises.map((e) => [e.name, e.order]),
    );
    expect(orderByName).toEqual({ A: 0, B: 1000, C: 2000, D: 0 });
  });

  it("numbers template exercises by their order, then old id, missing order last", () => {
    const result = remapLegacyTables(
      legacyTables({
        workoutTemplates: [pushTemplate],
        exerciseTemplates: [
          { id: 2, workoutTemplateId: 1, name: "No order" },
          { id: 3, workoutTemplateId: 1, name: "Second", order: 1 },
          { id: 4, workoutTemplateId: 1, name: "First", order: 0 },
          { id: 5, workoutTemplateId: 1, name: "Also second", order: 1 },
        ],
      }),
    );

    const names = [...result.templateExercises]
      .sort((a, b) => a.order - b.order)
      .map((e) => e.name);
    expect(names).toEqual(["First", "Second", "Also second", "No order"]);
    expect(
      result.templateExercises.map((e) => e.order).sort((a, b) => a - b),
    ).toEqual([
      0, 1000, 2000, 3000,
    ]);
  });

  it("keeps the same exercise name in different sessions as separate rows", () => {
    const result = remapLegacyTables(
      legacyTables({
        workoutSessions: [pushSession, { ...pushSession, id: 11 }],
        exerciseLogs: [
          { id: 20, sessionId: 10, name: "Bench press" },
          { id: 21, sessionId: 11, name: "Bench press" },
        ],
      }),
    );

    const [first, second] = result.sessionExercises;
    expect(first.id).not.toBe(second.id);
    expect(first.sessionId).not.toBe(second.sessionId);
  });
});
