/**
 * System notifications for the rest timer, shown through the service worker
 * (Android Chrome only allows notifications from there). Without a backend
 * they can only be shown while the app's JavaScript still runs in the
 * background, so they are best effort; everything is skipped where
 * notifications aren't available (e.g. iPhone outside an installed app).
 */

const REST_TAG = "rest-timer";

// `vibrate` and `renotify` work on Android Chrome but are missing from
// TypeScript's DOM types.
interface VibratingNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  renotify?: boolean;
}

const notificationsSupported = () =>
  "Notification" in window && "serviceWorker" in navigator;

/**
 * Asks for notification permission if it hasn't been answered yet. Call it
 * from a tap (e.g. starting the rest timer): browsers only show the prompt
 * in response to a user action.
 */
export function requestNotificationPermission() {
  if (notificationsSupported() && Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

/** Shows "Rest over", vibrating with `pattern` (also with the screen off). */
export async function showRestOverNotification(pattern: number[]) {
  if (!notificationsSupported() || Notification.permission !== "granted") {
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration) {
    return false;
  }

  const options: VibratingNotificationOptions = {
    body: "Time for your next set.",
    tag: REST_TAG,
    renotify: true,
    vibrate: pattern,
    icon: "/icons/pwa-192x192-v2.png",
    data: { url: location.href },
  };
  await registration.showNotification("Rest over", options);
  return true;
}

/** Removes a "Rest over" notification that is no longer needed. */
export async function closeRestOverNotification() {
  if (!notificationsSupported()) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  const notifications =
    (await registration?.getNotifications({ tag: REST_TAG })) ?? [];
  notifications.forEach((notification) => notification.close());
}
