/// <reference types="vite/client" />

declare const __AVATAR_PATHS__: Readonly<Record<string, string>>;

/**
 * Vite's own `ImportMetaEnv` carries an `[key: string]: any` index signature, so every read of a
 * `VITE_`-prefixed variable came back as `any` and spread that through `API_BASE_URL` into every
 * endpoint built from it. Declaring the variables this app actually reads replaces that with a real
 * type.
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
