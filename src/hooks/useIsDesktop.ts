import { useSyncExternalStore } from "react";

/** Mirrors the theme's `md` breakpoint, which the library layout switches on. */
export const DESKTOP_MEDIA_QUERY = "(min-width: 900px)";

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP_MEDIA_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * Prerendering has no viewport, so this reports `false` until hydration — which keeps the first
 * client render matching the server's. The library's CSS-selected loading slots make that static
 * document look correct at either width; this hook then mounts only the expensive result component
 * for the active viewport.
 */
export const useIsDesktop = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
    () => false,
  );
