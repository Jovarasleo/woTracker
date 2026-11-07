import { Card, Group, Skeleton, Stack } from "@mantine/core";
import { TextSkeleton } from "./TextSkeleton";

const PLACEHOLDER_EXERCISES = 4;

/**
 * Placeholder for the workout (template) page while it loads: the summary card,
 * the exercise list and the "Start session" button, at their real sizes.
 */
export function WorkoutSkeleton() {
  return (
    <Stack gap="md" aria-busy aria-label="Loading workout">
      <Card>
        <Group gap="sm" align="center" wrap="nowrap">
          <Skeleton height={32} width={32} circle />
          <div className="flex-1">
            <TextSkeleton order={2} width="50%" />
            <TextSkeleton size="sm" width="25%" />
          </div>
        </Group>
        <div className="mt-4">
          <TextSkeleton size="sm" width="45%" />
        </div>
      </Card>

      <Card padding="md">
        <div className="mb-3">
          <TextSkeleton order={4} width="30%" />
        </div>
        <Stack gap={0}>
          {Array.from({ length: PLACEHOLDER_EXERCISES }, (_, index) => (
            <div
              key={index}
              className="py-2 pl-9 border-b border-(--mantine-color-dark-4) last:border-b-0"
            >
              <TextSkeleton width={`${60 - index * 8}%`} />
            </div>
          ))}
        </Stack>
      </Card>

      <Skeleton height={42} radius="md" />
    </Stack>
  );
}
