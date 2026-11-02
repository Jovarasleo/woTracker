import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DevTools } from "../components/DevTools";
import { SessionsOverview } from "../components/SessionsOverview";
import { TemplatesOverview } from "../components/TemplatesOverview";

interface IndexSearch {
  /** Calendar month currently displayed, in `YYYY-MM` format. */
  month?: string;
}

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => ({
    month:
      typeof search.month === "string" && MONTH_PATTERN.test(search.month)
        ? search.month
        : undefined,
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <DevTools />
      <div className="text-end">
        <Link to="/workout/newTemplate">
          <Button size="md" leftSection={<IconPlus />}>
            Workout Template
          </Button>
        </Link>
      </div>
      <TemplatesOverview />
      <SessionsOverview />
    </>
  );
}
