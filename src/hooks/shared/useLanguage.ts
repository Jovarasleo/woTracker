import { useSyncExternalStore } from "react";
import {
  getLanguage,
  setLanguage,
  subscribeLanguage,
} from "../../i18n/translations";

/** The current UI language and a setter that switches (and saves) it. */
export function useLanguage() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage);

  return { language, setLanguage };
}
