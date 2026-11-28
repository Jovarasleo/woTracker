import "fake-indexeddb/auto";
import { Dexie } from "dexie";
import { expect, it } from "vitest";

const V9_STORES = {
  workoutTemplates: "++id, name, createdAt",
  exerciseTemplates: "++id, workoutTemplateId, order",
  workoutSessions: "++id, name, date, workoutTemplateId",
  exerciseLogs:
    "++id, sessionId, name, order, createdAt, exerciseTemplateId, [sessionId+exerciseTemplateId]",
  setLogs: "++id, exerciseLogId, setNumber",
  customExercises: "++id, name, createdAt",
};

async function seedVersion9() {
  const legacy = new Dexie("WorkoutDB");
  legacy.version(9).stores(V9_STORES);

  await legacy.table("workoutTemplates").add({
    name: "Push",
    createdAt: "2026-01-01T10:00:00.000Z",
    indicatorColor: "#ff0000",
  });
  await legacy.table("exerciseTemplates").bulkAdd([
    { workoutTemplateId: 1, name: "Bench press", order: 0 },
    { workoutTemplateId: 1, name: "Dips", order: 1 },
  ]);
  await legacy.table("workoutSessions").bulkAdd([
    {
      name: "Push",
      date: "2026-02-01T10:00:00.000Z",
      workoutTemplateId: 1,
      indicatorColor: "#ff0000",
      finishedAt: "2026-02-01T11:00:00.000Z",
    },
    {
      name: "Quick workout",
      date: "2026-02-03T10:00:00.000Z",
      indicatorColor: "#00ff00",
    },
  ]);
  await legacy.table("exerciseLogs").bulkAdd([
    { sessionId: 1, name: "Bench press", order: 0, exerciseTemplateId: 1 },
    { sessionId: 1, name: "Dips", order: 1000, exerciseTemplateId: 2 },
    { sessionId: 2, name: "Rowing", kind: "cardio", durationMinutes: 20 },
  ]);
  await legacy.table("setLogs").bulkAdd([
    { exerciseLogId: 1, weight: 80, reps: 8, setNumber: 1 },
    { exerciseLogId: 1, weight: 80, reps: 6, setNumber: 2 },
    { exerciseLogId: 2, weight: 0, reps: 12, setNumber: 1 },
    { exerciseLogId: 99, weight: 10, reps: 10, setNumber: 1 },
  ]);
  await legacy.table("customExercises").add({
    name: "Sled push",
    createdAt: "2026-01-02T10:00:00.000Z",
  });

  legacy.close();
}

it("upgrades a v9 database to UUID tables and removes the old ones", async () => {
  await seedVersion9();

  const { db } = await import("./db");
  await db.open();

  expect(db.verno).toBe(11);
  expect([...db.backendDB().objectStoreNames].sort()).toEqual([
    "sessionExercises",
    "sessionSets",
    "sessions",
    "templateExercises",
    "templates",
    "userExercises",
  ]);

  const [template] = await db.templates.toArray();
  const templateExercises = await db.templateExercises
    .where("templateId")
    .equals(template.id)
    .sortBy("order");
  expect(templateExercises.map((exercise) => exercise.name)).toEqual([
    "Bench press",
    "Dips",
  ]);

  const push = await db.sessions.where("templateId").equals(template.id).first();
  expect(push?.finishedAt).toBe("2026-02-01T11:00:00.000Z");

  const pushExercises = await db.sessionExercises
    .where("sessionId")
    .equals(push?.id ?? "")
    .sortBy("order");
  expect(pushExercises.map((exercise) => exercise.templateExerciseId)).toEqual(
    templateExercises.map((exercise) => exercise.id),
  );

  const benchSets = await db.sessionSets
    .where("sessionExerciseId")
    .equals(pushExercises[0].id)
    .sortBy("setNumber");
  expect(benchSets.map((set) => set.reps)).toEqual([8, 6]);
  expect(await db.sessionSets.count()).toBe(3);

  const quick = await db.sessions.filter((s) => s.templateId == null).first();
  const [rowing] = await db.sessionExercises
    .where("sessionId")
    .equals(quick?.id ?? "")
    .toArray();
  expect(rowing).toMatchObject({ kind: "cardio", durationMinutes: 20 });

  expect(await db.userExercises.count()).toBe(1);

  db.close();
});
