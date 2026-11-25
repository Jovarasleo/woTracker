import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { db } from "../../store/db";
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
      const sessionId = await db.workoutSessions.add({
        name: t.session.quickWorkoutName,
        date: new Date().toISOString(),
        indicatorColor: randomIndicatorColor(),
      });

      await navigate({
        to: "/session/$sessionId",
        params: { sessionId: sessionId.toString() },
      });
    } finally {
      setStarting(false);
    }
  };

  return { startQuickWorkout, starting };
}
