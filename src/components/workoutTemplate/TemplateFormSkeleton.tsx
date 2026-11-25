import { Card, Group, Skeleton, Stack } from "@mantine/core";
import { TextSkeleton } from "../shared/TextSkeleton";
import { t } from "../../i18n/translations";

const PLACEHOLDER_EXERCISES = 3;

export function TemplateFormSkeleton() {
  return (
    <Card aria-busy aria-label={t.workout.loading}>
      <Stack>
        <div>
          <TextSkeleton size="sm" width={110} />
          <Skeleton height={36} radius="md" />
        </div>

        <div>
          <TextSkeleton size="sm" width={80} />
          <Stack gap="xs" mt={4}>
            {Array.from({ length: PLACEHOLDER_EXERCISES }, (_, index) => (
              <Group key={index} gap="xs" wrap="nowrap">
                <Skeleton height={36} radius="md" className="flex-1" />
                <Skeleton height={28} width={28} radius="md" />
              </Group>
            ))}
          </Stack>
        </div>

        <Skeleton height={36} radius="md" />

        <div>
          <TextSkeleton size="sm" width={110} />
          <TextSkeleton size="xs" width={220} />
          <Skeleton height={28} width={120} radius="md" className="mt-1 mb-2" />
          {/* Height of the full-width `ColorPicker size="lg"` with swatches. */}
          <Skeleton height={308} radius="md" />
        </div>

        <Group justify="flex-end">
          <Skeleton height={36} width={80} radius="md" />
          <Skeleton height={36} width={70} radius="md" />
        </Group>
      </Stack>
    </Card>
  );
}
