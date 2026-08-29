import { afterEach, describe, expect, it, vi } from "vitest";

import {
  installStaleDeployRecovery,
  isStaleChunkError,
  recoverFromStaleDeploy,
  type RecoveryDeps,
} from "./staleDeploy";

const NOW = 1_700_000_000_000;

const createDeps = (overrides: Partial<RecoveryDeps> = {}): RecoveryDeps => {
  const entries = new Map<string, string>();

  return {
    storage: {
      getItem: (key) => entries.get(key) ?? null,
      setItem: (key, value) => {
        entries.set(key, value);
      },
    },
    reload: vi.fn(),
    now: () => NOW,
    isOnline: () => true,
    ...overrides,
  };
};

const staleChunkError = () =>
  new Error(
    "Failed to fetch dynamically imported module: https://library.powercalc.nl/assets/x.js",
  );

describe("isStaleChunkError", () => {
  it.each([
    "Failed to fetch dynamically imported module: /assets/route-a1b2c3.js",
    "error loading dynamically imported module: /assets/route-a1b2c3.js",
    "Importing a module script failed.",
    "Unable to preload CSS for /assets/route-a1b2c3.css",
  ])("recognises %s", (message) => {
    expect(isStaleChunkError(new Error(message))).toBe(true);
  });

  it("accepts the message as a bare string", () => {
    expect(isStaleChunkError("Failed to fetch dynamically imported module")).toBe(true);
  });

  it("ignores an unrelated error", () => {
    expect(isStaleChunkError(new Error("The Powercalc API did not respond"))).toBe(false);
  });

  it("ignores a rejection that carries no message", () => {
    expect(isStaleChunkError({ status: 404 })).toBe(false);
    expect(isStaleChunkError(undefined)).toBe(false);
  });
});

describe("recoverFromStaleDeploy", () => {
  it("reloads on a stale chunk", () => {
    const deps = createDeps();

    expect(recoverFromStaleDeploy(staleChunkError(), deps)).toBe(true);
    expect(deps.reload).toHaveBeenCalledTimes(1);
  });

  it("leaves an unrelated error alone", () => {
    const deps = createDeps();

    expect(recoverFromStaleDeploy(new Error("Network request failed"), deps)).toBe(false);
    expect(deps.reload).not.toHaveBeenCalled();
  });

  it("does not reload again while the cooldown is running", () => {
    const deps = createDeps();
    recoverFromStaleDeploy(staleChunkError(), deps);

    const stillCoolingDown = { ...deps, now: () => NOW + 59_000 };
    expect(recoverFromStaleDeploy(staleChunkError(), stillCoolingDown)).toBe(false);
    expect(deps.reload).toHaveBeenCalledTimes(1);
  });

  it("recovers again from a later deploy in the same tab", () => {
    const deps = createDeps();
    recoverFromStaleDeploy(staleChunkError(), deps);

    const afterCooldown = { ...deps, now: () => NOW + 61_000 };
    expect(recoverFromStaleDeploy(staleChunkError(), afterCooldown)).toBe(true);
    expect(deps.reload).toHaveBeenCalledTimes(2);
  });

  it("does not reload while the browser is offline", () => {
    const deps = createDeps({ isOnline: () => false });

    expect(recoverFromStaleDeploy(staleChunkError(), deps)).toBe(false);
    expect(deps.reload).not.toHaveBeenCalled();
  });

  it("still reloads when storage is unavailable", () => {
    const deps = createDeps({ storage: null });

    expect(recoverFromStaleDeploy(staleChunkError(), deps)).toBe(true);
    expect(deps.reload).toHaveBeenCalledTimes(1);
  });

  it("survives a storage that throws on every access", () => {
    const deps = createDeps({
      storage: {
        getItem: () => {
          throw new Error("denied");
        },
        setItem: () => {
          throw new Error("denied");
        },
      },
    });

    expect(recoverFromStaleDeploy(staleChunkError(), deps)).toBe(true);
    expect(deps.reload).toHaveBeenCalledTimes(1);
  });
});

describe("installStaleDeployRecovery", () => {
  const listeners: Array<[string, EventListener]> = [];

  // Captured rather than registered directly, so every test starts from a window that carries only
  // its own listeners and `stopImmediatePropagation` cannot reach across tests.
  const install = (deps: RecoveryDeps) => {
    const spy = vi.spyOn(window, "addEventListener").mockImplementation(() => {});
    installStaleDeployRecovery(deps);
    const registered = [...spy.mock.calls] as Array<[string, EventListener]>;
    spy.mockRestore();

    for (const [type, listener] of registered) {
      listeners.push([type, listener]);
      window.addEventListener(type, listener);
    }
  };

  afterEach(() => {
    for (const [type, listener] of listeners.splice(0)) {
      window.removeEventListener(type, listener);
    }
  });

  it("reloads and claims a stale chunk announced by Vite", () => {
    const deps = createDeps();
    install(deps);

    const event: Event & { payload?: unknown } = new Event("vite:preloadError", {
      cancelable: true,
    });
    event.payload = staleChunkError();
    window.dispatchEvent(event);

    expect(deps.reload).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("lets Vite rethrow a failure it cannot recover from", () => {
    const deps = createDeps({ isOnline: () => false });
    install(deps);

    const event: Event & { payload?: unknown } = new Event("vite:preloadError", {
      cancelable: true,
    });
    event.payload = staleChunkError();
    window.dispatchEvent(event);

    expect(deps.reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("keeps a recovered rejection away from the reporting listener", () => {
    const deps = createDeps();
    install(deps);

    const reportedByLaterListener = vi.fn();
    window.addEventListener("unhandledrejection", reportedByLaterListener);
    listeners.push(["unhandledrejection", reportedByLaterListener]);

    const rejection = new Event("unhandledrejection", { cancelable: true }) as Event & {
      reason?: unknown;
    };
    rejection.reason = staleChunkError();
    window.dispatchEvent(rejection);

    expect(deps.reload).toHaveBeenCalledTimes(1);
    expect(reportedByLaterListener).not.toHaveBeenCalled();
  });

  it("leaves an unrelated rejection to the reporting listener", () => {
    const deps = createDeps();
    install(deps);

    const reportedByLaterListener = vi.fn();
    window.addEventListener("unhandledrejection", reportedByLaterListener);
    listeners.push(["unhandledrejection", reportedByLaterListener]);

    const rejection = new Event("unhandledrejection", { cancelable: true }) as Event & {
      reason?: unknown;
    };
    rejection.reason = new Error("The Powercalc API did not respond");
    window.dispatchEvent(rejection);

    expect(deps.reload).not.toHaveBeenCalled();
    expect(reportedByLaterListener).toHaveBeenCalledTimes(1);
  });
});
