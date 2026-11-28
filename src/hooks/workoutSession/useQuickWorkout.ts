import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { db } from "../../store/db";
import { newId } from "../../utils/ids";
import { randomIndicatorColor } from "../../utils/colors";
import { t } from "../../i18n/translations";

export function useQuickWorkout() {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  const startQuickWorkout = async () => {
    // `starting` blocks a double tap from creating two sessions.
    if (starting) {
      return;
    }

    setStarting(true);
    try {
      const sessionId = await db.sessions.add({
        id: newId(),
        name: t.session.quickWorkoutName,
        date: new Date().toISOString(),
        indicatorColor: randomIndicatorColor(),
      });

      await navigate({
        to: "/session/$sessionId",
        params: { sessionId: sessionId },
      });
    } finally {
      setStarting(false);
    }
  };

  return { startQuickWorkout, starting };
}
