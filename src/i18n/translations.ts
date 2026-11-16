import dayjs from "dayjs";
import "dayjs/locale/lt";
import { en, type Translations } from "./en";
import { lt } from "./lt";

/**
 * All UI text of the app. Components read it through `t` (e.g.
 * `t.common.cancel`), so TypeScript flags any key that doesn't exist. Text
 * that depends on values is a function (`t.common.exerciseCount(3)`).
 *
 * `t` always holds the current language. Switching (`setLanguage`) remounts
 * the pages (see `__root.tsx`), so everything renders again with the new
 * text — the React Compiler would otherwise keep showing cached output.
 *
 * To add a language: create an object typed as `Translations` (the compiler
 * lists every missing key), then add it to `TRANSLATIONS` and `LANGUAGES`.
 */

export type { Translations };

export type Language = "en" | "lt";

const TRANSLATIONS: Record<Language, Translations> = { en, lt };

/** Options for the language switch, each named in its own language. */
export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "lt", label: "Lietuvių" },
];

const DEFAULT_LANGUAGE: Language = "en";

// A UI preference read synchronously before the first render, so the app
// never flashes in the wrong language; that's why it's in localStorage
// rather than IndexedDB.
const STORAGE_KEY = "language";

const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && value in TRANSLATIONS;

function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    // Storage can be unavailable (e.g. blocked by privacy settings).
    return DEFAULT_LANGUAGE;
  }
}

/** Points dates (dayjs, the calendar) and the page's `lang` at `next`. */
function applyLanguage(next: Language) {
  dayjs.locale(next);
  document.documentElement.lang = next;
}

let language = readStoredLanguage();
applyLanguage(language);

/** The active language's text. */
export let t: Translations = TRANSLATIONS[language];

const listeners = new Set<() => void>();

export const getLanguage = () => language;

export const subscribeLanguage = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Switches the UI language and remembers it for the next visit. */
export function setLanguage(next: Language) {
  if (next === language) {
    return;
  }

  language = next;
  t = TRANSLATIONS[next];
  applyLanguage(next);

  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Not saved; the choice still applies until the app is reloaded.
  }

  listeners.forEach((listener) => listener());
}
