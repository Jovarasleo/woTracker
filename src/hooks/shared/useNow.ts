import dayjs from "dayjs";
import { useEffect, useState } from "react";

export function useNow(intervalMs: number) {
  const [now, setNow] = useState(dayjs);

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
