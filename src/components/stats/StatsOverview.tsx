import { Text, Tooltip } from "@mantine/core";
import {
  IconCalendarMonth,
  IconCalendarWeek,
  IconFlame,
  IconTrophy,
} from "@tabler/icons-react";
import { StatTile } from "./StatTile";
import type { WorkoutSession } from "../../store/db";
import { computeSessionStats } from "../../utils/sessionStats";
import { t } from "../../i18n/translations";

interface Props {
  sessions: WorkoutSession[];
}

/** Row of training metrics: this week (with day dots), month, streak, total. */
export function StatsOverview({ sessions }: Props) {
  const stats = computeSessionStats(sessions);
  const iconSize = 18;

  return (
    <section
      aria-label={t.stats.sectionLabel}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      <StatTile
        label={t.stats.thisWeek}
        value={stats.thisWeek}
        color="blue"
        icon={<IconCalendarWeek size={iconSize} />}
      >
        <div className="mt-2 flex gap-1" aria-hidden>
          {stats.weekDays.map((trained, index) => (
            <Tooltip
              key={t.stats.weekdayNames[index]}
              label={t.stats.weekdayNames[index]}
            >
              <span
                className={`flex h-5 flex-1 items-center justify-center rounded text-[10px] font-semibold ${
                  trained
                    ? "bg-blue-500 text-white"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                {t.stats.weekdayLetters[index]}
              </span>
            </Tooltip>
          ))}
        </div>
      </StatTile>
      <StatTile
        label={t.stats.thisMonth}
        value={stats.thisMonth}
        color="teal"
        icon={<IconCalendarMonth size={iconSize} />}
      >
        <Text size="xs" c="dimmed" mt="xs">
          {t.stats.sessionsLogged}
        </Text>
      </StatTile>
      <StatTile
        label={t.stats.weekStreak}
        value={stats.weekStreak}
        color="orange"
        icon={<IconFlame size={iconSize} />}
      >
        <Text size="xs" c="dimmed" mt="xs">
          {t.stats.weeksInARow(stats.weekStreak)}
        </Text>
      </StatTile>
      <StatTile
        label={t.stats.allTime}
        value={stats.total}
        color="grape"
        icon={<IconTrophy size={iconSize} />}
      >
        <Text size="xs" c="dimmed" mt="xs">
          {t.stats.totalSessions}
        </Text>
      </StatTile>
    </section>
  );
}
