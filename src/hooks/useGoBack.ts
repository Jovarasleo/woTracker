import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";

/**
 * Leaves a form page by going back in history, so the form's entry is not left
 * behind: pressing Back afterwards won't reopen the (already saved) form, and
 * the previous page restores its scroll position. When the page was opened
 * directly (nothing in-app to go back to), replaces it with the home page.
 */
export function useGoBack() {
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  return () => {
    if (canGoBack) {
      router.history.back();
      return;
    }

    navigate({ to: "/", replace: true });
  };
}
