import type { WorkoutSession } from "../store/db";

/**
 * Curated indicator-color palette for workout templates. These are Mantine's
 * primary swatch values, chosen to read well on the app's dark background.
 */
export const INDICATOR_COLORS = [
  "#fa5252",
  "#e64980",
  "#be4bdb",
  "#7950f2",
  "#4c6ef5",
  "#228be6",
  "#15aabf",
  "#12b886",
  "#40c057",
  "#82c91e",
  "#fab005",
  "#fd7e14",
] as const;

/** Picks a random color from the indicator palette. */
export function randomIndicatorColor(): string {
  return INDICATOR_COLORS[Math.floor(Math.random() * INDICATOR_COLORS.length)];
}

/**
 * Indicator color for a session: the live color of the template it was created
 * from, falling back to the color snapshotted on the session itself (used when
 * the template was deleted or the session has no template link).
 */
export function sessionIndicatorColor(
  session: WorkoutSession,
  templateColorById: Map<number, string>,
): string {
  const templateColor =
    session.workoutTemplateId != null
      ? templateColorById.get(session.workoutTemplateId)
      : undefined;
  return templateColor ?? session.indicatorColor;
}
