import { Group, Skeleton } from "@mantine/core";

export function SetRowSkeleton() {
  return (
    <Group gap="xs" wrap="nowrap" align="center" aria-hidden>
      <div className="w-5 shrink-0" />
      <Skeleton height={36} radius="md" className="flex-1" />
      <Skeleton height={36} radius="md" className="flex-1" />
      <div className="w-8.5 shrink-0" />
    </Group>
  );
}
