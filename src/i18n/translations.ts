import { createElement, Fragment, type ReactNode } from "react";

/**
 * All UI text of the app. Components read it through `t` (e.g.
 * `t.common.cancel`), so TypeScript flags any key that doesn't exist. Text
 * that depends on values is a function (`t.common.exerciseCount(3)`).
 *
 * To add a language, create another object typed as `Translations` — the
 * compiler then lists every key it is missing — and pick it in `t` below.
 */

/** "1 set" / "3 sets". */
const plural = (count: number, one: string, other: string) =>
  `${count} ${count === 1 ? one : other}`;

/**
 * Joins text with inline elements (e.g. a bold name) into one node. Children
 * passed as arguments, unlike an array, need no keys.
 */
const rich = (...parts: ReactNode[]) =>
  createElement(Fragment, null, ...parts);

const en = {
  common: {
    add: "Add",
    addExercise: "Add exercise",
    back: "Back",
    cancel: "Cancel",
    cardio: "Cardio",
    custom: "Custom",
    delete: "Delete",
    dismiss: "Dismiss",
    done: "Done",
    edit: "Edit",
    exercises: "Exercises",
    goHome: "Go to home",
    ok: "OK",
    removeExercise: "Remove exercise",
    save: "Save",
    strength: "Strength",
    undo: "Undo",
    workoutName: "Workout name",
    exerciseCount: (count: number) =>
      plural(count, "exercise", "exercises"),
  },

  home: {
    newWorkout: "New workout",
    greeting: {
      lateNight: "Late night session?",
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
  },

  sidePanel: {
    title: "Menu",
    open: "Open menu",
    close: "Close menu",
  },

  backup: {
    menuButton: "Backup and restore",
    menuLabel: "Backup",
    export: "Export data",
    import: "Import data",
    feedbackTitle: "Backup",
    restoreTitle: "Restore backup?",
    replaceData: "Replace data",
    unknownDate: "an unknown date",
    /** `all` is rendered bold. */
    restoreWarning: (all: (text: string) => ReactNode, date: string) =>
      rich(
        "This replaces ",
        all("all"),
        ` current workouts, sessions and sets with the backup from ${date}. Your current data is downloaded as a file first.`,
      ),
    tableCount: (table: string, count: number) => `${table}: ${count}`,
    exported: (counts: string) => `Backup downloaded (${counts}).`,
    exportFailed: (error: string) => `Export failed: ${error}`,
    restored:
      "Backup restored. Your previous data was downloaded as wotracker-before-import.",
    importFailed: (error: string) =>
      `Import failed, no data was changed: ${error}`,
    errors: {
      invalidJson: "This file is not valid JSON.",
      notABackup: "This file is not a woTracker backup.",
      otherApp: "This backup was made by a different app.",
      newerVersion:
        "This backup was made by a newer version of the app. Update the app and try again.",
      malformedTable: (table: string) =>
        `Table "${table}" in this backup is malformed.`,
      noData: "This backup contains no woTracker data.",
    },
  },

  stats: {
    sectionLabel: "Training stats",
    thisWeek: "This week",
    thisMonth: "This month",
    sessionsLogged: "sessions logged",
    weekStreak: "Week streak",
    weeksInARow: (count: number) =>
      `${count === 1 ? "week" : "weeks"} in a row`,
    allTime: "All time",
    totalSessions: "total sessions",
    /** Monday first. */
    weekdayLetters: ["M", "T", "W", "T", "F", "S", "S"],
    /** Monday first. */
    weekdayNames: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },

  relativeDay: {
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: (days: number) => `${days} days ago`,
    lastWeek: "Last week",
    weeksAgo: (weeks: number) => `${weeks} weeks ago`,
  },

  templates: {
    heading: "Workouts",
    quickWorkout: "Quick workout",
    emptyTitle: "No workouts yet",
    emptyText:
      "Create a workout template to start logging sessions, or jump straight into a quick workout.",
    createWorkout: "Create workout",
    notDoneYet: "Not done yet",
    openWorkout: "Open workout",
    options: (name: string) => `${name} options`,
    deleteTitle: "Delete workout template?",
    /** `name` is rendered bold. */
    deleteWarning: (name: ReactNode) =>
      rich(
        name,
        " and its exercise list will be removed. Sessions you already logged are kept.",
      ),
  },

  templateForm: {
    newTitle: "New workout",
    editTitle: "Edit workout",
    addExerciseTitle: "Add exercise to this template",
    indicatorColor: "Indicator color",
    indicatorColorDescription: "Shown as a colored tag for this workout",
    noExercises: "No exercises yet.",
    exerciseNumber: (number: number) => `Exercise ${number}`,
    needsOneExercise: "A workout needs at least one exercise",
    errors: {
      noExercises: "Add at least one exercise",
      exerciseNameRequired: "Exercise name is required",
      nameRequired: "Workout name is required",
      nameTooLong: (max: number) => `Keep it under ${max} characters`,
      nameTaken: "A workout with this name already exists",
    },
  },

  workout: {
    loading: "Loading workout",
    lastPerformed: (date: string) => `Last performed ${date}`,
    notPerformedYet: "Not performed yet",
    sessionCount: (count: number) => plural(count, "session", "sessions"),
    startSession: "Start session",
  },

  session: {
    /** Name of a session started without a template. */
    quickWorkoutName: "Quick workout",
    loading: "Loading session",
    notFoundTitle: "Session not found",
    notFound: "This session doesn't exist. It may have been deleted.",
    saveAsTemplate: "Save as template",
    saveAsTemplateText: (exerciseCount: string) =>
      `Saves this session's ${exerciseCount} as a workout you can start again.`,
    deleteSession: "Delete session",
    deleteTitle: "Delete session?",
    /** `name` is rendered bold. */
    deleteWarning: (name: ReactNode, date: string) =>
      rich(
        name,
        ` from ${date} and all its logged sets will be removed. This can't be undone.`,
      ),
    noExercises: "No exercises yet. Add one to start logging.",
    addExerciseTitle: "Add exercise to this session",
    exerciseRemoved: (name: string) => `${name} removed`,
    setRemoved: (name: string, position: number) =>
      position ? `${name} · set ${position} removed` : `${name} · set removed`,
  },

  sessionHistory: {
    sectionLabel: "Session history",
    heading: "History",
    emptyText: "Sessions you log will show up here and on the calendar.",
    recentSessions: "Recent sessions",
  },

  sets: {
    weight: "Weight",
    reps: "Reps",
    addSet: "Set",
    editSet: "Edit set",
    confirmSet: "Confirm set",
    removeSet: "Remove set",
    cantRemoveOnlySet:
      "Can't remove the only set; remove the exercise instead",
    lastTime: "Last time",
    lastTimeOn: (date: string) => `Last time: ${date}`,
  },

  cardio: {
    duration: "Duration (min)",
    distance: "Distance (km)",
    calories: "kcal",
    heartRate: "HR (bpm)",
    rpe: "RPE (1–10)",
    edit: "Edit cardio",
    confirm: "Confirm cardio",
    pace: (pace: string) => `Pace ${pace}`,
    /** Pace value, e.g. "5:53/km". */
    paceValue: (minutes: number, seconds: string) => `${minutes}:${seconds}/km`,
    summary: {
      duration: (minutes: number) => `${minutes} min`,
      distance: (km: number) => `${km} km`,
      calories: (kcal: number) => `${kcal} kcal`,
      heartRate: (bpm: number) => `${bpm} bpm`,
      rpe: (rpe: number) => `RPE ${rpe}`,
    },
  },

  restTimer: {
    rest: "Rest",
    restOver: "Rest over",
    restFor: "Rest for",
    stop: "Stop",
    addSeconds: (seconds: number) => `${seconds} s`,
    runningLabel: (remaining: string) => `Rest timer, ${remaining} left`,
    finishedLabel: "Rest over, start another rest timer",
    startLabel: "Start rest timer",
    notificationBody: "Time for your next set.",
  },

  exercise: {
    library: "Library",
    search: "Search exercises",
    allMuscles: "All muscles",
    showingSome: (shown: number, total: number) =>
      `Showing ${shown} of ${total} — refine your search to see more`,
    noneFound: "No exercises found",
    createCustom: "Create custom exercise",
    showDetails: (name: string) => `${name} — show exercise details`,
    muscles: "Muscles:",
    imageAlt: (name: string, step: number) => `${name} — step ${step}`,
    form: {
      name: "Exercise name",
      nameTaken: "An exercise with this name is already in the library",
      type: "Type",
      strengthDescription: "Logged as sets of weight × reps",
      cardioDescription: "Logged as duration and distance",
      primaryMuscle: "Primary muscle",
      optional: "Optional",
      equipment: "Equipment",
      equipmentStrengthPlaceholder: "Optional, e.g. dumbbell",
      equipmentCardioPlaceholder: "Optional, e.g. treadmill",
      description: "Description",
      descriptionPlaceholder: "Optional notes on how to perform it",
      submit: "Create & add",
    },
  },
};

export type Translations = typeof en;

/** The active language's text. Only English exists for now. */
export const t: Translations = en;
