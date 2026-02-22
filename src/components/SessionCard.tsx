import { Button, Card, Stack, Title } from "@mantine/core";
import type { WorkoutSession, WorkoutTemplate } from "../store/db";
import { Link } from "@tanstack/react-router";

interface Props {
  session: WorkoutSession;
  template: WorkoutTemplate;
}

export function SessionCard({ session, template }: Props) {
  return (
    <Card shadow="sm" padding="sm">
      <Stack>
        <Title order={4}>
          {`${template.name} — ${new Date(session.date).toLocaleString(
            "lt-LT",
            {
              year: "numeric",
              month: "short", // abbreviated month (e.g., vas for vasaris)
              day: "2-digit",
              hour: "2-digit",
              hour12: false, // 24-hour format
            },
          )}`}
          h
        </Title>

        <Link
          to="/session/$sessionId"
          params={{ sessionId: session.id!.toString() }}
        >
          <Button>Continue / View</Button>
        </Link>
      </Stack>
    </Card>
  );
}
