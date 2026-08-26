import { afterEach, describe, expect, it, vi } from "vitest";

import { readStorage, writeStorage } from "./safeStorage";

/**
 * Replaces `window.localStorage` for one test. The property is non-writable on the real `window`,
 * so it has to be redefined rather than assigned — which is also why a throwing implementation is
 * worth testing at all: some browsers throw on the property access itself.
 */
const withLocalStorage = (value: unknown) => {
  const original = Object.getOwnPropertyDescriptor(window, "localStorage");
  Object.defineProperty(window, "localStorage", { configurable: true, get: () => value });
  return () => {
    if (original) Object.defineProperty(window, "localStorage", original);
  };
};

describe("safeStorage", () => {
  const restores: (() => void)[] = [];
  afterEach(() => {
    while (restores.length) restores.pop()?.();
  });

  it("reads and writes through to the real store", () => {
    writeStorage("local", "panel", "true");
    expect(readStorage("local", "panel")).toBe("true");
  });

  it("reports a missing key as null", () => {
    expect(readStorage("local", "never-written")).toBeNull();
  });

  it("returns null instead of throwing when the store is blocked", () => {
    restores.push(
      withLocalStorage({
        getItem: () => {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      }),
    );

    expect(() => readStorage("local", "panel")).not.toThrow();
    expect(readStorage("local", "panel")).toBeNull();
  });

  it("swallows a write that exceeds quota", () => {
    const setItem = vi.fn(() => {
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    });
    restores.push(withLocalStorage({ setItem }));

    expect(() => writeStorage("local", "panel", "true")).not.toThrow();
    expect(setItem).toHaveBeenCalledOnce();
  });

  it("survives the property access itself throwing", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => {
        throw new DOMException("Access is denied for this document.", "SecurityError");
      },
    });
    restores.push(() => {
      if (original) Object.defineProperty(window, "localStorage", original);
    });

    expect(readStorage("local", "panel")).toBeNull();
    expect(() => writeStorage("local", "panel", "true")).not.toThrow();
  });
});
