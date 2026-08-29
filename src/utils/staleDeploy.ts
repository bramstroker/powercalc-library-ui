/**
 * Recovering from a route chunk that no longer exists on the origin.
 *
 * Asset filenames carry a content hash and `location /assets/` answers a missing file with a 404
 * rather than the SPA shell (see `etc/nginx.conf`). A deploy replaces the whole container, so every
 * hashed file from the previous build disappears at once — and the daily prerender refresh means
 * that happens every night, not only when the code changes. A tab opened before a deploy that
 * navigates after it therefore asks for a chunk that is gone and the dynamic import rejects.
 *
 * Reloading fetches the current document, which references the current asset URLs. The cooldown
 * keeps that to one attempt per failure: if the import still fails right after a reload the cause
 * is not a stale deploy, and the error has to reach the boundary instead of looping the page.
 */

const RELOAD_STAMP_KEY = "powercalc:stale-deploy-reload";

/**
 * Long enough to cover a reload and the navigation that failed, short enough that a second deploy
 * during the lifetime of the same tab still recovers.
 */
const RELOAD_COOLDOWN_MS = 60_000;

// Every engine words this differently, and none of them expose a machine-readable cause.
const STALE_CHUNK_MESSAGES = [
  "failed to fetch dynamically imported module", // Chromium
  "error loading dynamically imported module", // Firefox
  "importing a module script failed", // Safari
  "unable to preload css", // Vite's own preload helper
];

const messageOf = (reason: unknown): string => {
  if (reason instanceof Error) return reason.message;
  return typeof reason === "string" ? reason : "";
};

export const isStaleChunkError = (reason: unknown): boolean => {
  const message = messageOf(reason).toLowerCase();
  return STALE_CHUNK_MESSAGES.some((candidate) => message.includes(candidate));
};

type StampStorage = Pick<Storage, "getItem" | "setItem">;

export type RecoveryDeps = {
  /** Omitted where the browser denies storage access; recovery then simply runs unguarded. */
  storage: StampStorage | null;
  reload: () => void;
  now: () => number;
  isOnline: () => boolean;
};

const readStamp = (storage: StampStorage | null): number | null => {
  try {
    const raw = storage?.getItem(RELOAD_STAMP_KEY);
    if (!raw) return null;
    const stamp = Number(raw);
    return Number.isFinite(stamp) ? stamp : null;
  } catch {
    return null;
  }
};

const writeStamp = (storage: StampStorage | null, stamp: number) => {
  try {
    storage?.setItem(RELOAD_STAMP_KEY, String(stamp));
  } catch {
    // A tab that cannot remember the attempt still gets its one useful reload, because the failing
    // import is not retried without a navigation. Losing the guard beats losing the recovery.
  }
};

/**
 * Reloads when `reason` looks like a chunk left behind by a deploy.
 *
 * @returns whether the reload was triggered, so callers can leave the error alone when it was not.
 */
export const recoverFromStaleDeploy = (reason: unknown, deps: RecoveryDeps): boolean => {
  if (!isStaleChunkError(reason)) return false;

  // Offline, the very same failure means the network is gone. Reloading would replace the app with
  // the browser's offline page, which is strictly worse than the error boundary.
  if (!deps.isOnline()) return false;

  const now = deps.now();
  const lastAttempt = readStamp(deps.storage);
  if (lastAttempt !== null && now - lastAttempt < RELOAD_COOLDOWN_MS) return false;

  writeStamp(deps.storage, now);
  deps.reload();
  return true;
};

const browserDeps = (): RecoveryDeps => ({
  storage: (() => {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  })(),
  reload: () => {
    window.location.reload();
  },
  now: () => Date.now(),
  isOnline: () => window.navigator.onLine !== false,
});

/** Vite marks the event cancellable and rethrows the error unless a listener claims it. */
type PreloadErrorEvent = Event & { payload?: unknown };

/**
 * Called from the client entry, before the error reporting listeners. Both events are needed:
 * Vite's preload helper announces the failure before React Router turns it into a route error,
 * while a dynamic import made outside the router only ever surfaces as an unhandled rejection.
 */
export const installStaleDeployRecovery = (deps: RecoveryDeps = browserDeps()) => {
  window.addEventListener("vite:preloadError", (event) => {
    const { payload } = event as PreloadErrorEvent;
    if (recoverFromStaleDeploy(payload, deps)) {
      // Suppress the rethrow: the page is already on its way out, and reporting a stale chunk as a
      // crash would bury the real errors in Sentry.
      event.preventDefault();
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (!recoverFromStaleDeploy(event.reason, deps)) return;

    // The reporting listener registered after this one never sees the rejection, and the browser
    // leaves it out of the console: the page is already reloading over it.
    event.stopImmediatePropagation();
    event.preventDefault();
  });
};
