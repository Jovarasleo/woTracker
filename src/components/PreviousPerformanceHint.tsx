import { Text, Tooltip } from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { PreviousPerformance } from "../hooks/usePreviousPerformance";
import { summarizeCardio } from "../utils/cardio";

/** "60×8 · 55×10" for strength, "30 min · 5 km · 6:00/km · …" for cardio. */
function summarizePrevious(previous: PreviousPerformance) {
  if (previous.kind === "cardio") {
    return summarizeCardio(previous.metrics);
  }

  return previous.sets.map((set) => `${set.weight}×${set.reps}`).join(" · ");
}

interface Props {
  previous: PreviousPerformance;
}

/**
 * One dimmed line with what was logged the last time this exercise was done,
 * e.g. "Nov 2 · 60×8 · 60×8 · 55×10". The tooltip has the full date and the
 * full summary, in case the line is truncated on narrow screens.
 */
export function PreviousPerformanceHint({ previous }: Props) {
  const summary = summarizePrevious(previous);

  return (
    <Tooltip
      label={
        <>
          <div>
            Last time: {dayjs(previous.date).format("dddd, MMM D YYYY")}
          </div>
          <div>{summary}</div>
        </>
      }
      openDelay={300}
      multiline
      maw={280}
      events={{ hover: true, focus: true, touch: true }}
    >
      <Text
        size="xs"
        c="dimmed"
        className="flex min-w-0 items-center gap-1 text-left"
      >
        <IconHistory size={12} className="shrink-0" aria-label="Last time" />
        <span className="truncate">
          <span className="mr-2">{dayjs(previous.date).format("MMM D")}</span>
          {summary}
        </span>
      </Text>
    </Tooltip>
  );
}
