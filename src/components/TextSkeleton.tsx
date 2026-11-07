import {
  Skeleton,
  Text,
  Title,
  type MantineSize,
  type TitleOrder,
} from "@mantine/core";

interface Props {
  /** Width of the placeholder bar, e.g. `"60%"` or `120`. */
  width: number | string;
  /** `Text` size the placeholder stands in for. */
  size?: MantineSize;
  /** Stand in for a `Title` of this order instead of `Text`. */
  order?: TitleOrder;
}

/**
 * Placeholder for one line of text. It is exactly as tall as the real line
 * (the bar sits inside a line box of the same font size and line height), so
 * swapping in the loaded text doesn't shift the layout. Mantine resets the
 * margins of text, so wrap it in a plain element to space it.
 */
export function TextSkeleton({ width, size = "md", order }: Props) {
  const bar = (
    <Skeleton
      display="inline-block"
      height="0.75em"
      width={width}
      radius="sm"
      className="align-middle"
    />
  );

  if (order) {
    return (
      <Title order={order} component="div" aria-hidden>
        {bar}
      </Title>
    );
  }

  return (
    <Text size={size} component="div" aria-hidden>
      {bar}
    </Text>
  );
}
