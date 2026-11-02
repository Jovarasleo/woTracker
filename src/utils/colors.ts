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
