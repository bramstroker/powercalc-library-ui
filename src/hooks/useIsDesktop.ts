import { useSyncExternalStore } from "react";

/** Mirrors the theme's `md` breakpoint, which the library layout switches on. */
export const DESKTOP_MEDIA_QUERY = "(min-width: 900px)";

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP_MEDIA_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * Prerendering has no viewport, so the static document is always the phone layout and this reports
 * `false` until hydration — which is what keeps the first client render matching the server's.
 * Unlike a CSS `display` switch it actually unmounts the other layout, so the phone never pays for
 * rendering the data grid and the desktop never pays for the card list.
 */
export const useIsDesktop = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
    () => false,
  );
