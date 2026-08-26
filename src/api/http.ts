/**
 * `Response.json()` resolves to `any`, so returning it straight from a typed function hands back an
 * unchecked value wearing the declared type. Routing every call through here keeps that assertion in
 * one place instead of once per endpoint, and makes the API boundary the only spot in the app where
 * an unvalidated shape enters.
 */
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Combines a query's cancellation signal with the request deadline without depending on
 * `AbortSignal.any`, which is newer than some of the browsers this site still serves.
 */
const requestController = (callerSignal?: AbortSignal) => {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(callerSignal?.reason);
  const timeout = setTimeout(
    () => controller.abort(new DOMException("The request timed out.", "TimeoutError")),
    REQUEST_TIMEOUT_MS,
  );

  if (callerSignal?.aborted) {
    abortFromCaller();
  } else {
    callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeout);
      callerSignal?.removeEventListener("abort", abortFromCaller);
    },
  };
};

export const fetchJson = async <T>(
  url: string,
  errorMessage: string,
  callerSignal?: AbortSignal,
): Promise<T> => {
  const request = requestController(callerSignal);
  try {
    const response = await fetch(url, { signal: request.signal });
    if (!response.ok) {
      throw new Error(`${errorMessage} (HTTP ${response.status})`);
    }
    return (await response.json()) as T;
  } finally {
    request.cleanup();
  }
};
