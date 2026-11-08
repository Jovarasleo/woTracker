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
 * Session deletion with its confirmation step: whether the confirmation is
 * open, whether the delete is running, and the confirm action, which deletes
 * the session and then leaves its page.
 */
export function useWorkoutSession(sessionId: number) {
  const goBack = useGoBack();
  const [deleteConfirmOpened, deleteConfirm] = useDisclosure(false);
  const [deleting, setDeleting] = useState(false);

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

  return {
    deleteConfirmOpened,
    openDeleteConfirm: deleteConfirm.open,
    closeDeleteConfirm,
    deleting,
    confirmDelete,
  };
}
