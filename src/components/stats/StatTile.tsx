import { Paper, Text, ThemeIcon } from "@mantine/core";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  /** Extra content under the value, e.g. a caption or mini chart. */
  children?: ReactNode;
}

/** Compact metric card used in the home page stats row. */
export function StatTile({ label, value, icon, color, children }: Props) {
  return (
    <Paper withBorder radius="lg" p="md" className="h-full">
      <div className="flex items-center justify-between gap-2">
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} className="truncate">
          {label}
        </Text>
        <ThemeIcon variant="light" color={color} radius="md" size="md">
          {icon}
        </ThemeIcon>
      </div>
      <Text fw={700} fz={30} lh={1.2} mt={4} className="tabular-nums">
        {value}
      </Text>
      {children}
    </Paper>
  );
}
