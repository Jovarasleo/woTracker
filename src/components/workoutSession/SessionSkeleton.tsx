import { Card, Divider, Skeleton, Stack } from "@mantine/core";
import { Fragment } from "react";
import { SetRowSkeleton } from "./SetRowSkeleton";
import { TextSkeleton } from "../shared/TextSkeleton";

const PLACEHOLDER_EXERCISES = 2;

/**
 * Placeholder for the session page's card while it loads: the same title,
 * divider and exercise blocks (name, set row, "+ Set" button) as the real one.
 */
export function SessionSkeleton() {
  return (
    <Card aria-busy aria-label="Loading session">
      <Stack>
        <div>
          <TextSkeleton order={3} width="55%" />
          <TextSkeleton size="sm" width="35%" />
        </div>

        <Divider />

        {Array.from({ length: PLACEHOLDER_EXERCISES }, (_, index) => (
          <Fragment key={index}>
            {index > 0 && <Divider />}
            <Stack gap="xs">
              <div className="min-h-7 mb-2">
                <TextSkeleton width="40%" />
              </div>
              <div className="-mb-1 pl-7">
                <TextSkeleton size="sm" width="30%" />
              </div>
              <SetRowSkeleton />
              <Skeleton
                height={36}
                width={72}
                radius="md"
                className="self-end mt-3"
              />
            </Stack>
          </Fragment>
        ))}
      </Stack>
    </Card>
  );
}
