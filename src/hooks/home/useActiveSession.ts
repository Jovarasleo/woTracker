import { type UnfinishedSession } from "./useHomeOverview";
import { useNow } from "../shared/useNow";
import { isSessionActive, workoutMinutes } from "../../utils/sessionStatus";

const MINUTE = 60_000;

export function useActiveSession(unfinished?: UnfinishedSession) {
  const now = useNow(MINUTE);

  if (!unfinished || !isSessionActive(unfinished.session, now)) {
    return undefined;
  }

  return {
    ...unfinished,
    elapsedMinutes: workoutMinutes(unfinished.session, now),
  };
}
