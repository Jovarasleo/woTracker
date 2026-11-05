# woTracker

A simple, offline-first workout tracker that runs in the browser and installs on
your phone like a native app. Plan your workouts once, then log every session —
sets, weights and cardio — with your previous results right where you need them.

All data stays on your device. There is no account, no server and no tracking.

## Features

### Workout templates

- Create reusable workouts (e.g. _Push Day_, _Leg Day_) with an ordered list of
  exercises and a color used to recognize them across the app.
- Edit or delete templates at any time; past sessions are kept.
- Start a session from a template in one tap — its exercises are copied in, ready
  to log.

### Logging sessions

- **Strength exercises** are logged as sets of weight × reps. New sets copy the
  previous one, so repeating a set is a single tap.
- **Cardio exercises** are logged as duration and distance, plus optional
  calories, average heart rate and RPE (perceived effort, 1–10). Pace is
  calculated automatically.
- **Last time hints**: under each exercise you see what you did the previous time
  (e.g. `Oct 29 · 60×8 · 60×8 · 55×10` or `28 min · 4.76 km · 5:53/km`), so you
  know what to beat without leaving the screen.
- Inputs stay locked until you tap edit, preventing accidental changes mid-workout.
- Add or remove exercises and sets on the fly in edit mode.

### Exercise library

- Pick from **750+ built-in exercises** with step-by-step instructions and
  example pictures, searchable by name and filterable by muscle.
- Create your own custom exercises (strength or cardio) when something is
  missing.

### Progress overview

- Home dashboard with sessions this week (with a day-by-day view), this month,
  your weekly training streak and all-time total.
- A calendar marks training days in each workout's color; tap a day to open
  that session.
- Recent sessions list and "last done" info on every workout card.

### Built for the phone

- Installable as an app (PWA) on Android, iOS and desktop, and works fully
  offline.
- Mobile-first, dark layout with a bottom navigation bar within thumb reach;
  adapts to tablet and desktop screens.
- Remembers your scroll position and calendar month when you navigate back.

### Your data

- Everything is stored locally in the browser (IndexedDB).
- **Export** all data to a JSON backup file and **import** it on another device.
  Before an import replaces your data, the current data is downloaded as a
  safety copy.

## Tech stack

- **React 19** with the React Compiler, **TypeScript** (strict)
- **Vite 7** with **vite-plugin-pwa** (Workbox) for offline support and
  installability
- **TanStack Router** (file-based routing)
- **Mantine** UI components and **Tailwind CSS v4** for layout
- **Dexie** (IndexedDB) with live queries, so the UI updates as data changes
- **React Hook Form** for form validation
- Exercise data from the public-domain
  [free-exercise-db](https://github.com/yuhonas/free-exercise-db)

## Getting started

Requires Node.js 20.19+ or 22.12+ (needed by Vite 7).

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build for production
npm run preview   # serve the production build locally
npm run lint      # run ESLint
```

In development, a **Dev tools** panel on the home page can seed a year of
sample workouts or clear all data.

To refresh the built-in exercise library from the source dataset:

```bash
npm run exercises:fetch
```

Coding conventions for contributors are described in [CLAUDE.md](CLAUDE.md).

## License

[MIT](LICENSE)
