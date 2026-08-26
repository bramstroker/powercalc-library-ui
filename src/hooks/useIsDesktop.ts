import { useSyncExternalStore } from "react";

/** Mirrors the theme's `md` breakpoint, which the library layout switches on. */
export const DESKTOP_MEDIA_QUERY = "(min-width: 900px)";

/**
 * One `MediaQueryList` for the whole app. `getSnapshot` runs on every render React checks the store
 * on, and constructing a fresh list each time is pure waste — the object is stateless and its
 * `matches` is live.
 */
let mediaQuery: MediaQueryList | undefined;

const getMediaQuery = () => (mediaQuery ??= window.matchMedia(DESKTOP_MEDIA_QUERY));

const subscribe = (onChange: () => void) => {
  const query = getMediaQuery();
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
    () => getMediaQuery().matches,
    () => false,
  );
