import { Card, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { type WorkoutSession } from "../../store/db";
import { sessionIndicatorColor } from "../../utils/colors";
import { t } from "../../i18n/translations";

interface Props {
  session: WorkoutSession;
  exerciseCount: number;
  elapsedMinutes: number;
  templateColorById: Map<number, string>;
}

export function ActiveSessionBanner({
  session,
  exerciseCount,
  elapsedMinutes,
  templateColorById,
}: Props) {
  return (
    <Card className="hover:bg-white/5">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="h-10 w-1 shrink-0 rounded-full"
          style={{
            backgroundColor: sessionIndicatorColor(session, templateColorById),
          }}
        />
        <div className="min-w-0 flex-1">
          <Text size="xs" c="dimmed">
            {t.home.workoutInProgress}
          </Text>
          <Link
            to="/session/$sessionId"
            params={{ sessionId: session.id.toString() }}
            className="block truncate font-semibold outline-none after:absolute after:inset-0 after:rounded-(--mantine-radius-lg) focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-(--mantine-primary-color-filled)"
          >
            {session.name}
          </Link>
          <Text size="sm" c="dimmed">
            {t.home.activeSessionSummary(
              t.common.duration(elapsedMinutes),
              exerciseCount,
            )}
          </Text>
        </div>
        <IconChevronRight size={18} className="shrink-0 text-gray-500" />
      </div>
    </Card>
  );
}
