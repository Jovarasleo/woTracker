import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
  <div className="p-3 sm:p-6 flex flex-col min-h-dvh">
    <Outlet />
    <TanStackRouterDevtools position="top-right" />
  </div>
);

export const Route = createRootRoute({ component: RootLayout });
