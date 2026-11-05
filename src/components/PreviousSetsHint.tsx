import { Text, Tooltip } from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { PreviousPerformance } from "../hooks/usePreviousExerciseSets";

interface Props {
  previous: PreviousPerformance;
}

/**
 * One dimmed line with the sets from the last time this exercise was done,
 * e.g. "Nov 2 · 60×8 · 60×8 · 55×10". The full date is in the tooltip.
 */
export function PreviousSetsHint({ previous }: Props) {
  const sets = previous.sets
    .map((set) => `${set.weight}×${set.reps}`)
    .join(" · ");

  return (
    <Tooltip
      label={`Last time: ${dayjs(previous.date).format("dddd, MMM D YYYY")}`}
      openDelay={300}
    >
      <Text
        size="xs"
        c="dimmed"
        className="flex min-w-0 items-center gap-1 text-left"
      >
        <IconHistory size={12} className="shrink-0" aria-label="Last time" />
        <span className="truncate">
          <span className="mr-2">{dayjs(previous.date).format("MMM D")}</span>
          {sets}
        </span>
      </Text>
    </Tooltip>
  );
}
