import { Card, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type { WorkoutSession } from "../store/db";

interface Props {
  session: WorkoutSession;
}

export function SessionCard({ session }: Props) {
  return (
    <Link
      to="/session/$sessionId"
      params={{ sessionId: session.id!.toString() }}
    >
      <Card shadow="sm" padding="sm">
        <div className="flex justify-center">
          <Title order={4}>
            {`${session.name} — ${new Date(session.date).toLocaleString(
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
        </div>
      </Card>
    </Link>
  );
}
