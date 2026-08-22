import { useEffect, useState, type ReactNode } from "react";

/** True once the browser has hydrated; always false while prerendering. */
export const useIsHydrated = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
};

/**
 * Keeps live, fast-moving data out of the prerendered markup.
 *
 * A static page freezes whatever the API returned at build time. When the browser then renders the
 * current value the text differs, React reports a hydration mismatch and discards the prerendered
 * document — so one live counter costs the whole page its prerendering. Rendering that part only
 * after hydration keeps the static markup stable and still shows the reader fresh numbers.
 */
export const ClientOnly = ({ children }: { children: ReactNode }) =>
  useIsHydrated() ? <>{children}</> : null;
