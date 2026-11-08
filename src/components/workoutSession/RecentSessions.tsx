import { Paper, Text, Title, UnstyledButton } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import type { WorkoutSession } from "../../store/db";
import { sessionIndicatorColor } from "../../utils/colors";
import { formatDateTime } from "../../utils/dates";
import { formatRelativeDay } from "../../utils/sessionStats";

interface Props {
  /** Sessions to show, newest first. */
  sessions: WorkoutSession[];
  templateColorById: Map<number, string>;
  onSelectSession: (sessionId: number) => void;
}

/** List of the latest sessions with color, date and relative time. */
export function RecentSessions({
  sessions,
  templateColorById,
  onSelectSession,
}: Props) {
  return (
    <Paper withBorder radius="lg" p="md">
      <Title order={4} mb="xs">
        Recent sessions
      </Title>
      <ul className="-mx-2 flex flex-col">
        {sessions.map((session) => (
          <li key={session.id}>
            <UnstyledButton
              onClick={() => onSelectSession(session.id)}
              px="xs"
              py={8}
              className="flex w-full items-center gap-3 rounded-md hover:bg-white/5"
            >
              <span
                aria-hidden
                className="h-8 w-1 shrink-0 rounded-full"
                style={{
                  backgroundColor: sessionIndicatorColor(
                    session,
                    templateColorById,
                  ),
                }}
              />
              <div className="min-w-0 flex-1">
                <Text size="sm" fw={500} className="truncate">
                  {session.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatDateTime(session.date)}
                </Text>
              </div>
              <Text size="xs" c="dimmed" className="shrink-0">
                {formatRelativeDay(session.date)}
              </Text>
              <IconChevronRight size={16} className="shrink-0 text-gray-500" />
            </UnstyledButton>
          </li>
        ))}
      </ul>
    </Paper>
  );
}
