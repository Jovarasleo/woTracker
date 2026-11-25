import { Text, Tooltip } from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import type { PreviousPerformance } from "../../hooks/workoutSession/usePreviousPerformance";
import { summarizeCardio } from "../../utils/cardio";
import { formatDate, formatFullDate } from "../../utils/dates";
import { t } from "../../i18n/translations";

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

export function PreviousPerformanceHint({ previous }: Props) {
  const summary = summarizePrevious(previous);

  return (
    <Tooltip
      label={
        <>
          <div>{t.sets.lastTimeOn(formatFullDate(previous.date))}</div>
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
        className="flex min-w-0 items-center gap-1 text-left select-none"
      >
        <IconHistory
          size={12}
          className="shrink-0"
          aria-label={t.sets.lastTime}
        />
        <span className="truncate">
          <span className="mr-2">{formatDate(previous.date)}</span>
          {summary}
        </span>
      </Text>
    </Tooltip>
  );
}
