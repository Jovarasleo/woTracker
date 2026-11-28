import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import { useState } from "react";
import { db } from "../../store/db";
import { newId } from "../../utils/ids";
import { minutesBetween } from "../../utils/sessionStatus";
import { useGoBack } from "../shared/useGoBack";

const deleteSession = (sessionId: string) =>
  db.transaction(
    "rw",
    db.sessions,
    db.sessionExercises,
    db.sessionSets,
    async () => {
      const sessionExerciseIds = await db.sessionExercises
        .where("sessionId")
        .equals(sessionId)
        .primaryKeys();

      await db.sessionSets.where("sessionExerciseId").anyOf(sessionExerciseIds).delete();
      await db.sessionExercises.bulkDelete(sessionExerciseIds);
      await db.sessions.delete(sessionId);
    },
  );

/**
 * Creates a workout template from a session's exercises (in their order) and
 * links the session and its exercises to it, as if the session had been
 * started from that template. The session takes the template's name.
 */
const saveSessionAsTemplate = (sessionId: string, name: string) =>
  db.transaction(
    "rw",
    [
      db.sessions,
      db.templates,
      db.templateExercises,
      db.sessionExercises,
    ],
    async () => {
      const session = await db.sessions.get(sessionId);

      if (!session) {
        throw new Error("Session not found");
      }

      const exerciseLogs = await db.sessionExercises
        .where("sessionId")
        .equals(sessionId)
        .sortBy("order");

      const templateId = await db.templates.add({
        id: newId(),
        name,
        createdAt: new Date().toISOString(),
        indicatorColor: session.indicatorColor,
      });

      const templateExerciseIds = await db.templateExercises.bulkAdd(
        exerciseLogs.map((log, index) => ({
          id: newId(),
          templateId,
          name: log.name,
          kind: log.kind,
          order: index * 1000,
        })),
        { allKeys: true },
      );

      await db.sessionExercises.bulkUpdate(
        exerciseLogs.map((log, index) => ({
          key: log.id,
          changes: { templateExerciseId: templateExerciseIds[index] },
        })),
      );
      await db.sessions.update(sessionId, {
        name,
        templateId,
      });
    },
  );

interface Options {
  onFinished?: () => void;
}

export function useWorkoutSession(
  sessionId: string,
  { onFinished }: Options = {},
) {
  const goBack = useGoBack();
  const [deleteConfirmOpened, deleteConfirm] = useDisclosure(false);
  const [deleting, setDeleting] = useState(false);
  const [saveTemplateOpened, saveTemplateDialog] = useDisclosure(false);
  const [finishTimeOpened, finishTimeDialog] = useDisclosure(false);

  // Can't be dismissed while the delete is running.
  const closeDeleteConfirm = () => {
    if (!deleting) {
      deleteConfirm.close();
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteSession(sessionId);
      goBack();
    } finally {
      setDeleting(false);
    }
  };

  /** Runs with a valid, trimmed name; see `useWorkoutTemplateForm`. */
  const saveAsTemplate = async (name: string) => {
    await saveSessionAsTemplate(sessionId, name);
    saveTemplateDialog.close();
  };

  const finishSession = async () => {
    await db.sessions.update(sessionId, {
      finishedAt: new Date().toISOString(),
    });
    onFinished?.();
  };

  const resumeSession = () =>
    db.transaction("rw", db.sessions, async () => {
      const session = await db.sessions.get(sessionId);

      if (!session?.finishedAt) {
        return;
      }

      await db.sessions.update(sessionId, {
        finishedAt: undefined,
        pausedMinutes:
          (session.pausedMinutes ?? 0) +
          minutesBetween(session.finishedAt, dayjs()),
      });
    });

  const saveFinishedAt = async (finishedAt: string) => {
    await db.sessions.update(sessionId, { finishedAt });
    finishTimeDialog.close();
  };

  return {
    finishSession,
    resumeSession,
    finishTimeOpened,
    openFinishTime: finishTimeDialog.open,
    closeFinishTime: finishTimeDialog.close,
    saveFinishedAt,
    deleteConfirmOpened,
    openDeleteConfirm: deleteConfirm.open,
    closeDeleteConfirm,
    deleting,
    confirmDelete,
    saveTemplateOpened,
    openSaveTemplate: saveTemplateDialog.open,
    closeSaveTemplate: saveTemplateDialog.close,
    saveAsTemplate,
  };
}
