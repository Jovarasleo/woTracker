import { Skeleton } from "@mantine/core";
import { TextSkeleton } from "./TextSkeleton";

interface Props {
  /** Width of the name bar, so a list of placeholders isn't uniform. */
  nameWidth: string;
}

/**
 * Placeholder with the same size as one result row in `ExerciseCreator`
 * (picture, name, muscles · equipment).
 */
export function ExerciseRowSkeleton({ nameWidth }: Props) {
  return (
    <div className="flex items-center gap-3 p-2" aria-hidden>
      <Skeleton height={48} width={48} radius="sm" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <TextSkeleton size="sm" width={nameWidth} />
        <TextSkeleton size="xs" width="35%" />
      </div>
    </div>
  );
}
