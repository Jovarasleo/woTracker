// Loaded into the generated service worker (`workbox.importScripts` in
// vite.config.ts). Tapping a notification (e.g. "Rest over") brings the app
// back: focus an open window if there is one, otherwise open the page the
// notification came from.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        const open = windows.find((client) => "focus" in client);
        return open ? open.focus() : self.clients.openWindow(url);
      }),
  );
});
