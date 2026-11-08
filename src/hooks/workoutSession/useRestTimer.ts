import { useSyncExternalStore } from "react";
import {
  closeRestOverNotification,
  requestNotificationPermission,
  showRestOverNotification,
} from "../../utils/notifications";

/** Three buzzes: on, pause, on, pause, on (milliseconds). */
const VIBRATION_PATTERN = [300, 150, 300, 150, 300];
/** How often the countdown updates. Short, so seconds tick over on time. */
const TICK_MS = 250;
/**
 * Coming back to the app long after the rest ended (it was paused in the
 * background) shouldn't buzz for a rest that's long over.
 */
const MAX_LATE_VIBRATION_MS = 5000;
/**
 * In the background the phone slows timers down, so the end is noticed a bit
 * late; still notify then, but not for a rest that ended long ago.
 */
const MAX_LATE_NOTIFICATION_MS = 2 * 60_000;
/** How long "Rest over" stays up before the timer goes back to idle. */
const FINISHED_DISPLAY_MS = 10_000;

const vibrate = () => {
  // Not supported everywhere (e.g. iOS Safari); then the screen state is all.
  if ("vibrate" in navigator) {
    navigator.vibrate(VIBRATION_PATTERN);
  }
};

/**
 * Tells the user the rest is over. On screen: vibrate. With the app hidden or
 * the screen off, the page can't vibrate, so show a system notification that
 * vibrates instead (best effort: needs permission and a phone that keeps the
 * app running in the background).
 */
const signalRestOver = (lateMs: number) => {
  if (document.visibilityState === "visible") {
    if (lateMs < MAX_LATE_VIBRATION_MS) {
      vibrate();
    }

    return;
  }

  if (lateMs < MAX_LATE_NOTIFICATION_MS) {
    void showRestOverNotification(VIBRATION_PATTERN);
  }
};

/*
 * The timer lives in this module rather than in a component, so it keeps
 * running (and still signals the end) when the user leaves the session page,
 * e.g. for the home page, and shows the same countdown on return. It is
 * in-memory only: reloading the app stops it.
 */

interface RestTimerState {
  /** When the rest ends (ms timestamp), `null` when no rest is running. */
  endsAt: number | null;
  /** Time of the last tick, used for the countdown. */
  now: number;
  /** The rest just ran out ("Rest over" is showing). */
  finished: boolean;
}

let state: RestTimerState = { endsAt: null, now: Date.now(), finished: false };
const listeners = new Set<() => void>();
let tickInterval: ReturnType<typeof setInterval> | undefined;
let finishedTimeout: ReturnType<typeof setTimeout> | undefined;
let listeningForReturn = false;

const setState = (changes: Partial<RestTimerState>) => {
  state = { ...state, ...changes };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

const tick = () => {
  if (state.endsAt === null) {
    return;
  }

  const current = Date.now();

  if (current < state.endsAt) {
    setState({ now: current });
    return;
  }

  clearInterval(tickInterval);
  tickInterval = undefined;
  signalRestOver(current - state.endsAt);
  setState({ endsAt: null, now: current, finished: true });

  clearTimeout(finishedTimeout);
  finishedTimeout = setTimeout(
    () => setState({ finished: false }),
    FINISHED_DISPLAY_MS,
  );
};

/** Back in the app, a "Rest over" notification has done its job. */
const closeNotificationOnReturn = () => {
  if (listeningForReturn) {
    return;
  }

  listeningForReturn = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void closeRestOverNotification();
    }
  });
};

const startRest = (seconds: number) => {
  // Asked on the first start, so the prompt answers a tap of the user's.
  requestNotificationPermission();
  void closeRestOverNotification();
  closeNotificationOnReturn();

  clearTimeout(finishedTimeout);
  const current = Date.now();
  setState({ endsAt: current + seconds * 1000, now: current, finished: false });

  clearInterval(tickInterval);
  tickInterval = setInterval(tick, TICK_MS);
};

const addRest = (seconds: number) => {
  if (state.endsAt !== null) {
    setState({ endsAt: state.endsAt + seconds * 1000 });
  }
};

const stopRest = () => {
  clearInterval(tickInterval);
  tickInterval = undefined;
  clearTimeout(finishedTimeout);
  setState({ endsAt: null, finished: false });
};

/**
 * Countdown between sets. Keeps the end time rather than counting ticks, so
 * the remaining time stays right even when the phone pauses the app. When it
 * runs out the phone vibrates (see `signalRestOver`) and the timer shows as
 * finished for a while. Shared app-wide: see the note above `RestTimerState`.
 */
export function useRestTimer() {
  const { endsAt, now, finished } = useSyncExternalStore(
    subscribe,
    getSnapshot,
  );

  /** Whole seconds left (rounded up, so it shows 0:01 until it's over). */
  const remainingSeconds =
    endsAt === null ? null : Math.max(0, Math.ceil((endsAt - now) / 1000));

  return { remainingSeconds, finished, startRest, addRest, stopRest };
}
