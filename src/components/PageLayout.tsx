import { ActionIcon, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useGoBack } from "../hooks/useGoBack";

/** Shared max width of sub-page content and its bar. */
const CONTENT_WIDTH = "max-w-xl";

interface Props {
  /** Shown in the bar, so the page stays identifiable while scrolled. */
  title: string;
  subtitle?: string;
  /** The page's main action (e.g. an Edit button), shown on the right. */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Page wrapper with a navigation bar holding a back button, the page title and
 * an optional action. On phones the bar is fixed to the bottom of the screen
 * (within thumb reach, clear of the iPhone home indicator); from `sm` up it
 * sticks to the top instead. Installed apps have no browser back button, so
 * pages below the home screen need this. Also sets the shared content width,
 * so every sub-page lines up with its bar.
 */
export function PageLayout({ title, subtitle, action, children }: Props) {
  const goBack = useGoBack();

  return (
    // Bottom padding keeps the fixed phone bar from covering the last content.
    <div className="flex w-full flex-col pb-28 sm:pb-0">
      <header className="fixed inset-x-0 bottom-0 z-50 border-t border-(--mantine-color-dark-4) bg-(--mantine-color-body) sm:sticky sm:top-0 sm:bottom-auto sm:mb-4 sm:border-t-0 sm:border-b">
        {/*
          Phones: at least 1rem from the sides and bottom so the buttons clear
          rounded display corners (or the safe-area insets, e.g. the iPhone
          home indicator, when larger). Wider screens use compact padding.
        */}
        <div
          className={`mx-auto flex w-full items-center gap-2 pt-2 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:pr-3 sm:pb-2 sm:pl-3 ${CONTENT_WIDTH}`}
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            size="xl"
            aria-label="Back"
            onClick={goBack}
          >
            <IconArrowLeft size={22} />
          </ActionIcon>
          <div className="min-w-0 flex-1 text-left">
            <Text fw={600} truncate>
              {title}
            </Text>
            {subtitle && (
              <Text size="xs" c="dimmed" truncate>
                {subtitle}
              </Text>
            )}
          </div>
          {action}
        </div>
      </header>

      <div className={`mx-auto w-full ${CONTENT_WIDTH}`}>{children}</div>
    </div>
  );
}
