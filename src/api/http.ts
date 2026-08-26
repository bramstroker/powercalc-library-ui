/**
 * `Response.json()` resolves to `any`, so returning it straight from a typed function hands back an
 * unchecked value wearing the declared type. Routing every call through here keeps that assertion in
 * one place instead of once per endpoint, and makes the API boundary the only spot in the app where
 * an unvalidated shape enters.
 */
export const fetchJson = async <T>(url: string, errorMessage: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${errorMessage} (HTTP ${response.status})`);
  }
  return (await response.json()) as T;
};
