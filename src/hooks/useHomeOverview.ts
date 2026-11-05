import { useLiveQuery } from "dexie-react-hooks";
import { db, type WorkoutSession, type WorkoutTemplate } from "../store/db";

export interface TemplateSummary {
  template: WorkoutTemplate;
  exerciseCount: number;
  /** Date of the most recent session started from this template. */
  lastSessionDate?: string;
}

export interface HomeOverview {
  templates: TemplateSummary[];
  /** All sessions, newest first. */
  sessions: WorkoutSession[];
  templateColorById: Map<number, string>;
}

const byNewestDate = (a: WorkoutSession, b: WorkoutSession) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

/**
 * Reads everything the home page shows: templates with their exercise counts
 * and last session, plus all sessions. Used by the route loader (so the page
 * renders at full height and scroll position can be restored) and by the live
 * query in `useHomeOverview`.
 */
export async function loadHomeOverview(): Promise<HomeOverview> {
  const [templates, exerciseTemplates, sessions] = await Promise.all([
    db.workoutTemplates.toArray(),
    db.exerciseTemplates.toArray(),
    db.workoutSessions.toArray(),
  ]);

  sessions.sort(byNewestDate);

  const exerciseCountByTemplate = new Map(
    templates.map((template) => [
      template.id,
      exerciseTemplates.filter(
        (exercise) => exercise.workoutTemplateId === template.id,
      ).length,
    ]),
  );

  // Later entries overwrite earlier ones, so feeding sessions oldest → newest
  // leaves the most recent session date per template.
  const lastSessionByTemplate = new Map(
    [...sessions]
      .reverse()
      .flatMap((session) =>
        session.workoutTemplateId == null
          ? []
          : [[session.workoutTemplateId, session.date] as const],
      ),
  );

  return {
    templates: templates.map((template) => ({
      template,
      exerciseCount: exerciseCountByTemplate.get(template.id) ?? 0,
      lastSessionDate: lastSessionByTemplate.get(template.id),
    })),
    sessions,
    templateColorById: new Map(
      templates.map((template) => [template.id, template.indicatorColor]),
    ),
  };
}

/**
 * Live home page data, seeded with `initialOverview` from the route loader so
 * the first render already has content, plus the template delete action.
 */
export function useHomeOverview(initialOverview: HomeOverview) {
  const overview = useLiveQuery(loadHomeOverview, [], initialOverview);

  /** Deletes a template and its exercises. Past sessions are kept. */
  const deleteTemplate = async (templateId: number) => {
    await db.transaction(
      "rw",
      db.workoutTemplates,
      db.exerciseTemplates,
      async () => {
        await db.exerciseTemplates
          .where("workoutTemplateId")
          .equals(templateId)
          .delete();
        await db.workoutTemplates.delete(templateId);
      },
    );
  };

  return { overview, deleteTemplate };
}
