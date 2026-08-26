import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

/**
 * jsdom does not implement `matchMedia`, and `LibraryGrid` calls it while its module evaluates to
 * start the desktop grid chunk early. Without this stub any test that so much as imports that
 * module — including one only interested in the route's `meta` — fails on the import itself.
 *
 * It reports the phone layout, matching what `useIsDesktop` serves during prerendering, so the
 * default in tests is the same layout the static document is built for.
 */
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
