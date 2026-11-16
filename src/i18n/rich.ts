import { createElement, Fragment, type ReactNode } from "react";

/**
 * Joins text with inline elements (e.g. a bold name) into one node. Children
 * passed as arguments, unlike an array, need no keys.
 */
export const rich = (...parts: ReactNode[]) =>
  createElement(Fragment, null, ...parts);
