import { Button, Card, Stack, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type { WorkoutSession } from "../store/db";

interface Props {
  session: WorkoutSession;
}

export function SessionCard({ session }: Props) {
  return (
    <Card shadow="sm" padding="sm">
      <Stack>
        <Title order={4}>
          {`${session.name} — ${new Date(session.date).toLocaleString("lt-LT", {
            year: "numeric",
            month: "short", // abbreviated month (e.g., vas for vasaris)
            day: "2-digit",
            hour: "2-digit",
            hour12: false, // 24-hour format
          })}`}
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
