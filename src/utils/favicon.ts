const ACTIVE_FAVICON = "/favicon.svg";
const INACTIVE_FAVICON = "/favicon-inactive.svg";

export function syncFaviconWithVisibility() {
  const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");

  if (!link) {
    return;
  }

  const update = () => {
    link.href = document.hidden ? INACTIVE_FAVICON : ACTIVE_FAVICON;
  };

  update();
  document.addEventListener("visibilitychange", update);
}
