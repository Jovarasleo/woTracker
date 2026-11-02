# SKILLS.md — Code Quality Rules for woTracker

This document defines the coding standards and conventions for **woTracker**, an
offline-first workout tracking PWA. Follow these rules when adding or changing code so
the codebase stays consistent. Rules are derived from the existing code — when in
doubt, match the surrounding files.

## Tech Stack (do not deviate without a reason)

- **React 19** with the **React Compiler** enabled (`babel-plugin-react-compiler`).
- **TypeScript** in `strict` mode, bundler module resolution, `verbatimModuleSyntax`.
- **Vite 7** for dev/build, **vite-plugin-pwa** for offline support.
- **TanStack Router** with **file-based routing** (`src/routes/`, `routeTree.gen.ts`).
- **Mantine v8** (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`) for UI
  components, **Tailwind CSS v4** for layout/spacing utilities.
- **Dexie 4** (IndexedDB) with **dexie-react-hooks** for all persistence.
- **@tabler/icons-react** for icons.

Do not introduce a competing library (another router, state manager, data layer, or UI
kit) for something the stack above already handles.

## TypeScript

- Keep `strict` on. Never add `// @ts-ignore` or `any` to silence an error — fix the
  type. `noUnusedLocals` and `noUnusedParameters` are enforced, so remove dead
  variables and imports.
- Define data shapes as exported `interface` declarations in `src/store/db.ts`. Reuse
  those interfaces everywhere instead of re-declaring object shapes.
- Type component props with a local `interface Props { ... }` and destructure them in
  the function signature.
- Use **type-only imports** for types (`import { type ExerciseLog }` or
  `import type { WorkoutSession }`) — `verbatimModuleSyntax` requires it.
- Prefer `as const` tuples for fixed option sets (e.g. the `useToggle(["default",
  "edit"] as const)` session-mode pattern) so the values stay literal-typed.

## Components

- Write **function components**, never class components.
- Use **named exports** for reusable components (`export function ExerciseEditor(...)`);
  do not add `default` exports.
- One component per file; name the file after the component (`SessionCard.tsx`).
- Keep presentational components (`src/components/`) free of direct DB mutation logic —
  pass data in via props and surface user actions through `on*`/`onDelete*` callback
  props so parents (routes) own the behavior.
- Event handlers are named `on<Thing>` or `handle<Thing>` (`onEditExercise`,
  `handleSubmit`). Keep that convention.
- Render a loading state (`<Loader />` or `Loading...`) while live queries are
  `undefined`, and bail early (`if (!session || !exerciseLogs) return <Loader />`)
  before rendering content that depends on them.

## Data & Persistence (Dexie)

- **All reads and writes go through `db` from `src/store/db.ts`.** Do not touch
  IndexedDB or `localStorage` directly.
- Read reactive data with **`useLiveQuery`** so the UI updates automatically. Pass a
  correct dependency array (e.g. `[numericSessionId]`) just like React hooks.
- Every DB operation is **`async`/`await`**. Mutation helpers return the new record id
  (`add` result) when callers need it.
- Group **multi-table writes in a `db.transaction("rw", ...)`** (see
  `workout/new.tsx`) so related rows commit atomically.
- Put mutation logic in **custom hooks** under `src/hooks/` (`useExercise`,
  `useExerciseLogEditor`) rather than inlining DB calls in components.
- When updating the schema, add a **new `db.version(n).stores({...})`** migration — do
  not edit an existing version block.
- Preserve ordering with the **sparse `order` field** convention (new items get
  `existing.length * 1000`) so rows can be reordered later without renumbering.

## Routing

- Add pages as files in `src/routes/`; the route tree is **generated** —
  `src/routeTree.gen.ts` is build output, so never edit it by hand.
- Each route file exports `Route = createFileRoute("/path")({ component })`.
- Read URL params via `Route.useParams()`, and **convert numeric id params with
  `Number(...)`** into a `numericXId` before using them in queries.
- Navigate with the typed `Link` component or `useNavigate()`; pass `params` as strings
  (`id.toString()`). Do not hand-build URL strings.

## Styling

- Use **Mantine components** for interactive UI (`Button`, `Card`, `Modal`,
  `NumberInput`, `ActionIcon`, `Title`, `Stack`, etc.) — don't hand-roll raw HTML
  equivalents.
- Use **Tailwind utility classes** for layout, spacing, and flex/grid positioning
  (`className="flex justify-between items-center mb-2"`).
- Keep the two concerns separate: Mantine for component behavior/variants, Tailwind for
  layout. Avoid inline `style={{...}}` except for small one-offs where a utility doesn't
  exist (e.g. icon sizing).
- The app is **dark-mode first** (`MantineProvider defaultColorScheme="dark"`) — pick
  colors that work on a dark background.

## Formatting & Conventions

- 2-space indentation, **double-quoted** strings, semicolons, trailing commas in
  multiline literals (matches existing files).
- `camelCase` for variables/functions, `PascalCase` for components/types/interfaces.
- Keep imports grouped: external packages first, then local modules (`../store/db`,
  `../hooks/...`).
- Prefer small, pure helper functions and early returns over deeply nested conditionals.

## Before Committing

- Run **`npm run lint`** (ESLint: JS recommended + typescript-eslint + react-hooks +
  react-refresh) and fix all errors.
- Run **`npm run build`** (`tsc -b && vite build`) — it must pass with no type errors.
- Keep components compatible with the **React Compiler**: follow the Rules of React (no
  mutating props/state, no conditional hooks) so auto-memoization stays valid.
- Do not commit generated or ignored files (`dist`, `node_modules`, `*.local`).
