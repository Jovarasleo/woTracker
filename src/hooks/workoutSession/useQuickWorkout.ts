import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { db } from "../../store/db";
import { randomIndicatorColor } from "../../utils/colors";

/** Name of a session started without a template, until it is saved as one. */
export const QUICK_WORKOUT_NAME = "Quick workout";

/** Starts an empty session that isn't based on a template, and opens it. */
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
        name: QUICK_WORKOUT_NAME,
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
