import { useEffect, useState } from "react";

/** Three buzzes: on, pause, on, pause, on (milliseconds). */
const VIBRATION_PATTERN = [300, 150, 300, 150, 300];
/** How often the countdown updates. Short, so seconds tick over on time. */
const TICK_MS = 250;
/**
 * Coming back to the app long after the rest ended (it was in the background,
 * where timers are paused) shouldn't buzz for a rest that's long over.
 */
const MAX_LATE_VIBRATION_MS = 5000;
/** How long "Rest over" stays up before the timer goes back to idle. */
const FINISHED_DISPLAY_MS = 10_000;

const vibrate = () => {
  // Not supported everywhere (e.g. iOS Safari); then the screen state is all.
  if ("vibrate" in navigator) {
    navigator.vibrate(VIBRATION_PATTERN);
  }
};

/**
 * Countdown between sets. Keeps the end time rather than counting ticks, so
 * the remaining time stays right even when the phone pauses the app. When it
 * runs out the phone vibrates and the timer shows as finished for a while.
 */
export function useRestTimer() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (endsAt === null) {
      return;
    }

    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);

      if (current < endsAt) {
        return;
      }

      // Stop right here: another tick could fire before the re-render that
      // clears this interval, and would vibrate a second time.
      clearInterval(interval);

      if (current - endsAt < MAX_LATE_VIBRATION_MS) {
        vibrate();
      }

      setEndsAt(null);
      setFinished(true);
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [endsAt]);

  useEffect(() => {
    if (!finished) {
      return;
    }

    const timeout = setTimeout(() => setFinished(false), FINISHED_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [finished]);

  const startRest = (seconds: number) => {
    const current = Date.now();
    setNow(current);
    setEndsAt(current + seconds * 1000);
    setFinished(false);
  };

  const addRest = (seconds: number) => {
    setEndsAt((current) =>
      current === null ? null : current + seconds * 1000,
    );
  };

  const stopRest = () => {
    setEndsAt(null);
    setFinished(false);
  };

  /** Whole seconds left (rounded up, so it shows 0:01 until it's over). */
  const remainingSeconds =
    endsAt === null ? null : Math.max(0, Math.ceil((endsAt - now) / 1000));

  return { remainingSeconds, finished, startRest, addRest, stopRest };
}
