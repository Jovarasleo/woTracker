import { useSyncExternalStore } from "react";
import {
  getLanguage,
  setLanguage,
  subscribeLanguage,
} from "../../i18n/translations";

export function useLanguage() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage);

  return { language, setLanguage };
}
