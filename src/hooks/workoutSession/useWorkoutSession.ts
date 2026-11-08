import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { db } from "../../store/db";
import { useGoBack } from "../shared/useGoBack";

/** Deletes a session together with its exercises and their sets. */
const deleteSession = (sessionId: number) =>
  db.transaction(
    "rw",
    db.workoutSessions,
    db.exerciseLogs,
    db.setLogs,
    async () => {
      const exerciseLogIds = await db.exerciseLogs
        .where("sessionId")
        .equals(sessionId)
        .primaryKeys();

      await db.setLogs.where("exerciseLogId").anyOf(exerciseLogIds).delete();
      await db.exerciseLogs.bulkDelete(exerciseLogIds);
      await db.workoutSessions.delete(sessionId);
    },
  );

/**
 * Creates a workout template from a session's exercises (in their order) and
 * links the session and its exercises to it, as if the session had been
 * started from that template. The session takes the template's name.
 */
const saveSessionAsTemplate = (sessionId: number, name: string) =>
  db.transaction(
    "rw",
    [
      db.workoutSessions,
      db.workoutTemplates,
      db.exerciseTemplates,
      db.exerciseLogs,
    ],
    async () => {
      const session = await db.workoutSessions.get(sessionId);

      if (!session) {
        throw new Error("Session not found");
      }

      const exerciseLogs = await db.exerciseLogs
        .where("sessionId")
        .equals(sessionId)
        .sortBy("order");

      const templateId = await db.workoutTemplates.add({
        name,
        createdAt: new Date().toISOString(),
        indicatorColor: session.indicatorColor,
      });

      const exerciseTemplateIds = await db.exerciseTemplates.bulkAdd(
        exerciseLogs.map((log, index) => ({
          workoutTemplateId: templateId,
          name: log.name,
          kind: log.kind,
          order: index * 1000,
        })),
        { allKeys: true },
      );

      await db.exerciseLogs.bulkUpdate(
        exerciseLogs.map((log, index) => ({
          key: log.id,
          changes: { exerciseTemplateId: exerciseTemplateIds[index] },
        })),
      );
      await db.workoutSessions.update(sessionId, {
        name,
        workoutTemplateId: templateId,
      });
    },
  );

/**
 * Actions on a whole session, each with its confirmation step:
 * - delete: confirmation state, `deleting`, and `confirmDelete`, which
 *   deletes the session and then leaves its page;
 * - save as template: dialog state and `saveAsTemplate(name)`.
 */
export function useWorkoutSession(sessionId: number) {
  const goBack = useGoBack();
  const [deleteConfirmOpened, deleteConfirm] = useDisclosure(false);
  const [deleting, setDeleting] = useState(false);
  const [saveTemplateOpened, saveTemplateDialog] = useDisclosure(false);

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

  return {
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
