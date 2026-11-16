import { DatesProvider } from "@mantine/dates";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useLanguage } from "../hooks/shared/useLanguage";

const RootLayout = () => {
  const { language } = useLanguage();

  return (
    <DatesProvider settings={{ locale: language }}>
      <div className="p-3 sm:p-6 flex flex-col min-h-dvh">
        <Outlet key={language} />
        <TanStackRouterDevtools position="top-right" />
      </div>
    </DatesProvider>
  );
};

export const Route = createRootRoute({ component: RootLayout });
