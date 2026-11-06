import { Button, Card, createTheme } from "@mantine/core";

/**
 * App-wide Mantine theme: the single source for shared visual defaults, so
 * pages don't each pick their own radius, borders or button styles.
 *
 * - Surfaces (cards) are bordered with a large radius and no shadow; shadows
 *   are barely visible on the dark background.
 * - Controls (inputs, buttons, badges) use a medium radius.
 * - Secondary actions use `variant="default"`; primary actions keep the filled
 *   default. Reserve `light` for repeated "add" actions inside content.
 */
export const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  components: {
    Card: Card.extend({
      defaultProps: { withBorder: true, radius: "lg", padding: "lg" },
    }),
    Button: Button.extend({
      defaultProps: { radius: "md" },
    }),
  },
});
