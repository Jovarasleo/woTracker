import { Group, Skeleton } from "@mantine/core";

/**
 * Placeholder with the same size as one strength set row in `ExerciseEditor`
 * (set number, weight and reps inputs, edit button).
 */
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
