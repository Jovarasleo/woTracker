import { MantineProvider } from "@mantine/core";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { theme } from "./theme";
import { syncFaviconWithVisibility } from "./utils/favicon";

const router = createRouter({
  routeTree,
  scrollRestoration: true,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// After a deploy, an already-open page can still try to lazy-load a chunk
// (e.g. the exercise catalog) whose hashed filename no longer exists. Reload
// once to pick up the new index.html instead of leaving the app broken.
const PRELOAD_RELOAD_KEY = "preload-error-reload";
window.addEventListener("vite:preloadError", (event) => {
  if (sessionStorage.getItem(PRELOAD_RELOAD_KEY)) {
    return;
  }

  event.preventDefault();
  sessionStorage.setItem(PRELOAD_RELOAD_KEY, "1");
  window.location.reload();
});
window.addEventListener("load", () => {
  sessionStorage.removeItem(PRELOAD_RELOAD_KEY);
});

registerSW({ immediate: true });
syncFaviconWithVisibility();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <RouterProvider router={router} />
    </MantineProvider>
  </StrictMode>,
);
