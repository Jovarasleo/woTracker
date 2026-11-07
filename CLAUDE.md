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
- **react-hook-form** for forms with validation (`useForm`, `useFieldArray`). Put
  rules in a shared hook (see `useWorkoutTemplateForm`), not hand-rolled state.
  Don't rely on `useFieldArray` `rules` — with StrictMode + the React Compiler
  they are skipped in development; check array-level rules in the submit handler
  with `setError` instead.

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
- One component per file; name the file after the component (`TemplateCard.tsx`).
  Delete components once nothing imports them — don't leave dead files behind.
- Keep presentational components (`src/components/`) free of direct DB mutation logic —
  pass data in via props and surface user actions through `on*`/`onDelete*` callback
  props so parents (routes) own the behavior.
- Event handlers are named `on<Thing>` or `handle<Thing>` (`onEditExercise`,
  `handleSubmit`). Keep that convention.
- While live queries are `undefined`, render a **skeleton shaped like the real
  content** (no spinners or "Loading..." text) so nothing shifts when the data
  arrives. Bail early with a page skeleton (`if (!session || !exerciseLogs)
  return <PageLayout><SessionSkeleton /></PageLayout>`; omitting `title` shows a
  bar placeholder), or keep data-independent UI (tabs, search) rendered and only
  replace the data part. Use `TextSkeleton` for text lines (it matches the line
  height) and size block skeletons to the real control (36px inputs/buttons).
  Wait for anything that adds lines (e.g. previous-performance hints) before
  leaving the skeleton, so it can't pop in afterwards.

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
- Exercises are either **strength** (sets of weight × reps in `setLogs`) or
  **cardio** (`durationMinutes`/`distanceKm` on the `ExerciseLog`, no sets). The
  `kind` field is optional on stored rows (older data has none), so always read
  it through **`exerciseKindOf(...)`** rather than `exercise.kind`, and copy it
  along when an exercise moves from library → template → session.
- Preserve ordering with the **sparse `order` field** convention (new items get
  `existing.length * 1000`) so rows can be reordered later without renumbering.

## Routing

- Add pages as files in `src/routes/`; the route tree is **generated** —
  `src/routeTree.gen.ts` is build output, so never edit it by hand.
- Each route file exports `Route = createFileRoute("/path")({ component })`.
- Route components are **code-split automatically** (`autoCodeSplitting` in
  `vite.config.ts`); keep heavy, page-specific imports inside the route (or a
  component it uses) so they stay out of the home page's bundle.
- `index.html` holds only the theme (dark background, `color-scheme`, Mantine's
  color-scheme attribute) so nothing flashes white before the JS loads — no
  markup; all structure is rendered by React.
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
  colors that work on a dark background. For borders and surfaces use Mantine's
  palette variables (`border-(--mantine-color-dark-4)`), not Tailwind grays.
- Shared visual defaults live in the **Mantine theme** (`src/theme.ts`): cards are
  bordered, `radius="lg"`, no shadow; controls use `radius="md"`. Don't override
  these per page — change the theme instead.
- Mantine styles override Tailwind on Mantine components (margins, borders, font
  size); use Mantine props (`mt`, `fz`, `c`) there and Tailwind on plain elements.
- **Button hierarchy:** one filled button per view for the primary action;
  `variant="default"` for secondary actions (Cancel, Back, Edit); `variant="light"`
  for repeated "add" actions inside content (Add exercise, + Set);
  `variant="subtle"` only for icon buttons.
- Use **sentence case** for all labels and buttons ("Add exercise", "Workout name").
- Sub-pages (anything below home) are wrapped in **`PageLayout`**: it provides the
  back button/title bar (bottom on phones, top from `sm`) and the shared content
  width — don't set page widths yourself.
- Format dates only with the helpers in **`src/utils/dates.ts`** (`formatDate`,
  `formatDateTime`, `formatFullDate`), never ad-hoc `format()`/`toLocaleString()`.
- Text is left-aligned by default; `#root` must not set `text-align`.

## Formatting & Conventions

- 2-space indentation, **double-quoted** strings, semicolons, trailing commas in
  multiline literals (matches existing files).
- `camelCase` for variables/functions, `PascalCase` for components/types/interfaces.
- Keep imports grouped: external packages first, then local modules (`../store/db`,
  `../hooks/...`).
- Prefer small, pure helper functions and early returns over deeply nested conditionals.
- **Every `if` uses braces**, including one-line early returns, and is **followed by
  an empty line** before the next statement (no blank line needed when the `if` is the
  last statement in its block). Enforced by ESLint (`curly`,
  `padding-line-between-statements`); `npx eslint . --fix` applies both.

  ```ts
  if (!session) {
    return;
  }

  await db.workoutSessions.update(session.id, changes);
  ```

- **Build `Map`s (and `Set`s) declaratively** by passing an array of entries to the
  constructor — don't create an empty `Map` and fill it with a `for` loop or
  `.set()` calls in a `reduce`.

  ```ts
  const colorById = new Map(
    templates.map((template) => [template.id, template.indicatorColor]),
  );
  ```

  When several items share a key, rely on later entries overwriting earlier ones:
  order the array so the entry you want to keep comes last (e.g. sort oldest →
  newest to keep the latest session per day). Use `flatMap` returning `[]` to skip
  items that have no key.

## Before Committing

- Run **`npm run lint`** (ESLint: JS recommended + typescript-eslint + react-hooks +
  react-refresh) and fix all errors.
- Run **`npm run build`** (`tsc -b && vite build`) — it must pass with no type errors.
- Keep components compatible with the **React Compiler**: follow the Rules of React (no
  mutating props/state, no conditional hooks) so auto-memoization stays valid.
- Do not commit generated or ignored files (`dist`, `node_modules`, `*.local`).
