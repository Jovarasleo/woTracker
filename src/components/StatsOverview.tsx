import { Text, Tooltip } from "@mantine/core";
import {
  IconCalendarMonth,
  IconCalendarWeek,
  IconFlame,
  IconTrophy,
} from "@tabler/icons-react";
import { StatTile } from "./StatTile";
import type { WorkoutSession } from "../store/db";
import { computeSessionStats } from "../utils/sessionStats";

interface Props {
  sessions: WorkoutSession[];
}

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Row of training metrics: this week (with day dots), month, streak, total. */
export function StatsOverview({ sessions }: Props) {
  const stats = computeSessionStats(sessions);
  const iconSize = 18;

  return (
    <section
      aria-label="Training stats"
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      <StatTile
        label="This week"
        value={stats.thisWeek}
        color="blue"
        icon={<IconCalendarWeek size={iconSize} />}
      >
        <div className="mt-2 flex gap-1" aria-hidden>
          {stats.weekDays.map((trained, index) => (
            <Tooltip key={WEEKDAY_NAMES[index]} label={WEEKDAY_NAMES[index]}>
              <span
                className={`flex h-5 flex-1 items-center justify-center rounded text-[10px] font-semibold ${
                  trained
                    ? "bg-blue-500 text-white"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                {WEEKDAY_LABELS[index]}
              </span>
            </Tooltip>
          ))}
        </div>
      </StatTile>
      <StatTile
        label="This month"
        value={stats.thisMonth}
        color="teal"
        icon={<IconCalendarMonth size={iconSize} />}
      >
        <Text size="xs" c="dimmed" mt="xs">
          sessions logged
        </Text>
      </StatTile>
      <StatTile
        label="Week streak"
        value={stats.weekStreak}
        color="orange"
        icon={<IconFlame size={iconSize} />}
      >
        <Text size="xs" c="dimmed" mt="xs">
          {stats.weekStreak === 1 ? "week" : "weeks"} in a row
        </Text>
      </StatTile>
      <StatTile
        label="All time"
        value={stats.total}
        color="grape"
        icon={<IconTrophy size={iconSize} />}
      >
        <Text size="xs" c="dimmed" mt="xs">
          total sessions
        </Text>
      </StatTile>
    </section>
  );
}
