import { Badge } from "@mantine/core";
import { type ExerciseKind } from "../../store/db";
import { t } from "../../i18n/translations";

interface Props {
  kind: ExerciseKind;
}

/** Small "Cardio" tag next to an exercise name; renders nothing for strength. */
export function CardioBadge({ kind }: Props) {
  if (kind !== "cardio") {
    return null;
  }

  return (
    <Badge size="xs" variant="light" color="teal" className="shrink-0">
      {t.common.cardio}
    </Badge>
  );
}
