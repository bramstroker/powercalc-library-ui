/**
 * Sentry is loaded only when there is something to report.
 *
 * `@sentry/react` was the largest single dependency in the client entry, and `Sentry.init()` ran
 * before `hydrateRoot`, so both its bytes and its instrumentation work (fetch/history/console
 * wrapping) sat on the critical path of every page load. Loading it after hydration instead only
 * moved that work into the interaction window; a page load that never throws should not pay for it
 * at all.
 *
 * Native `error` and `unhandledrejection` listeners are installed up front — a few bytes, no
 * measurable cost — and the SDK is fetched the first time one of them, or an error boundary, has
 * something to send.
 *
 * Trade-off: with the SDK not instrumenting the page beforehand, reports no longer carry the
 * console/fetch/navigation breadcrumbs leading up to the error. The error itself, its stack, and the
 * component stack from the boundary are still reported.
 */

import type { captureException as captureExceptionType } from "@sentry/react";

const DSN =
  "https://0d99b37d629842e88ae62be9ecddd530@o4510889348890624.ingest.de.sentry.io/4510889353936976";

/**
 * Only the function this app calls is pulled out of the module. Destructuring at the `import()`
 * call site is what lets the bundler tree-shake the SDK: holding on to the whole namespace object
 * instead drags in every integration and transport it exports (roughly 135 kB compressed).
 */
type Capture = typeof captureExceptionType;

let loading: Promise<Capture> | null = null;

const load = (): Promise<Capture> => {
  loading ??= import("@sentry/react").then(({ init, captureException }) => {
    init({
      dsn: DSN,
      // Leave visitor PII (IP addresses among others) out of reports for this public EU-facing site.
      sendDefaultPii: false,
    });
    return captureException;
  });

  return loading;
};

/** Reports an error, fetching the SDK first if this is the first one. */
export const reportError = (error: unknown, componentStack?: string | null) => {
  void load().then((captureException) => {
    captureException(error, componentStack ? { extra: { componentStack } } : undefined);
  });
};

/**
 * Catches what the SDK's own global handlers would have caught. Called after `hydrateRoot`, and
 * free on a page load that never throws.
 */
export const installErrorReporting = () => {
  window.addEventListener("error", (event) => {
    reportError(event.error ?? event.message);
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason);
  });
};
