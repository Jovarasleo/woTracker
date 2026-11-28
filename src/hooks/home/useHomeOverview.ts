import { useLiveQuery } from "dexie-react-hooks";
import { db, type WorkoutSession, type WorkoutTemplate } from "../../store/db";

export interface TemplateSummary {
  template: WorkoutTemplate;
  exerciseCount: number;
  lastSessionDate?: string;
}

export interface UnfinishedSession {
  session: WorkoutSession;
  exerciseCount: number;
}

export interface HomeOverview {
  templates: TemplateSummary[];
  unfinished?: UnfinishedSession;
  /** All sessions, newest first. */
  sessions: WorkoutSession[];
  templateColorById: Map<string, string>;
}

const byNewestDate = (a: WorkoutSession, b: WorkoutSession) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

const byCreatedAt = (a: WorkoutTemplate, b: WorkoutTemplate) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

/**
 * Reads everything the home page shows: templates with their exercise counts
 * and last session, plus all sessions. Used by the route loader (so the page
 * renders at full height and scroll position can be restored) and by the live
 * query in `useHomeOverview`.
 */
export async function loadHomeOverview(): Promise<HomeOverview> {
  const [templates, exerciseTemplates, sessions] = await Promise.all([
    db.templates.toArray(),
    db.templateExercises.toArray(),
    db.sessions.toArray(),
  ]);

  templates.sort(byCreatedAt);
  sessions.sort(byNewestDate);

  const unfinishedSession = sessions.find((session) => !session.finishedAt);
  const unfinished = unfinishedSession && {
    session: unfinishedSession,
    exerciseCount: await db.sessionExercises
      .where("sessionId")
      .equals(unfinishedSession.id)
      .count(),
  };

  const exerciseCountByTemplate = new Map(
    templates.map((template) => [
      template.id,
      exerciseTemplates.filter(
        (exercise) => exercise.templateId === template.id,
      ).length,
    ]),
  );

  // Later entries overwrite earlier ones, so feeding sessions oldest → newest
  // leaves the most recent session date per template.
  const lastSessionByTemplate = new Map(
    [...sessions]
      .reverse()
      .flatMap((session) =>
        session.templateId == null
          ? []
          : [[session.templateId, session.date] as const],
      ),
  );

  return {
    templates: templates.map((template) => ({
      template,
      exerciseCount: exerciseCountByTemplate.get(template.id) ?? 0,
      lastSessionDate: lastSessionByTemplate.get(template.id),
    })),
    unfinished,
    sessions,
    templateColorById: new Map(
      templates.map((template) => [template.id, template.indicatorColor]),
    ),
  };
}

export function useHomeOverview(initialOverview: HomeOverview) {
  const overview = useLiveQuery(loadHomeOverview, [], initialOverview);

  /** Deletes a template and its exercises. Past sessions are kept. */
  const deleteTemplate = async (templateId: string) => {
    await db.transaction(
      "rw",
      db.templates,
      db.templateExercises,
      async () => {
        await db.templateExercises
          .where("templateId")
          .equals(templateId)
          .delete();
        await db.templates.delete(templateId);
      },
    );
  };

  return { overview, deleteTemplate };
}
