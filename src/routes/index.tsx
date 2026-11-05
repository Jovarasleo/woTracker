import { ActionIcon, Button, Loader, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { BackupMenu } from "../components/BackupMenu";
import { DevTools } from "../components/DevTools";
import { SessionsOverview } from "../components/SessionsOverview";
import { StatsOverview } from "../components/StatsOverview";
import { TemplatesOverview } from "../components/TemplatesOverview";
import { useHomeOverview } from "../hooks/useHomeOverview";
import { greetingFor } from "../utils/sessionStats";

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
  const { overview, deleteTemplate } = useHomeOverview();
  const now = dayjs();

  return (
    <div className="flex w-full flex-col gap-6 text-left">
      <DevTools />

      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Text size="sm" c="dimmed">
            {now.format("dddd, MMMM D")}
          </Text>
          <Title order={1} className="truncate text-2xl sm:text-3xl">
            {greetingFor(now)}
          </Title>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BackupMenu />
          <Button
            component={Link}
            tabIndex={0}
            to="/workout/newTemplate"
            size="md"
            leftSection={<IconPlus size={18} />}
            visibleFrom="sm"
          >
            New workout
          </Button>
          <ActionIcon
            component={Link}
            tabIndex={0}
            to="/workout/newTemplate"
            size="input-md"
            aria-label="New workout"
            hiddenFrom="sm"
          >
            <IconPlus size={20} />
          </ActionIcon>
        </div>
      </header>

      {!overview ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex min-w-0 flex-col gap-6">
            <StatsOverview sessions={overview.sessions} />
            <TemplatesOverview
              templates={overview.templates}
              onDeleteTemplate={deleteTemplate}
            />
          </div>
          <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <SessionsOverview
              sessions={overview.sessions}
              templateColorById={overview.templateColorById}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
