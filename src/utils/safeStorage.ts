/**
 * Web Storage that never throws.
 *
 * Every one of these calls can fail for reasons that have nothing to do with this app: Safari's
 * private mode, a browser configured to block site data, or a full quota. An unguarded `getItem`
 * inside an effect takes the whole page down through the error boundary, and an unguarded `setItem`
 * breaks the control the user just operated. Neither of these preferences is worth a failed render,
 * so a blocked store simply reads as "nothing remembered".
 */

type StorageKind = "local" | "session";

const store = (kind: StorageKind): Storage | null => {
  try {
    // Accessing the property itself throws when site data is blocked, so this is inside the try.
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

export const readStorage = (kind: StorageKind, key: string): string | null => {
  try {
    return store(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

export const writeStorage = (kind: StorageKind, key: string, value: string): void => {
  try {
    store(kind)?.setItem(key, value);
  } catch {
    // A preference that cannot be persisted still applies to this session.
  }
};
