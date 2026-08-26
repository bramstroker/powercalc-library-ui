import { PassThrough } from "node:stream";

import { createReadableStreamFromReadable } from "@react-router/node";
import { renderToPipeableStream } from "react-dom/server";
import type { EntryContext, RouterContextProvider } from "react-router";
import { ServerRouter } from "react-router";

export const streamTimeout = 10_000;

/**
 * Copied from the React Router default entry to change one thing: this build never streams.
 *
 * The default picks `onShellReady` unless the request comes from a known bot or the app is in SPA
 * mode. Prerendering is neither — it sends no user agent, and `ssr: false` + `prerender` is not SPA
 * mode — so every generated document was emitted mid-stream: a Suspense fallback inline, the real
 * page in a trailing `<div hidden>`, and a `$RC` script to swap them once React boots. Anything
 * that does not run JavaScript (link unfurlers, non-executing crawlers, reader modes) therefore saw
 * a loading spinner instead of the page.
 *
 * `onAllReady` waits for every Suspense boundary to settle and writes the finished markup inline,
 * which is what React documents it for: crawlers and static generation.
 */
export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: RouterContextProvider,
) {
  // https://httpwg.org/specs/rfc9110.html#HEAD
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, { status: responseStatusCode, headers: responseHeaders });
  }

  return new Promise((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + 1000,
    );

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onAllReady() {
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });

          responseHeaders.set("Content-Type", "text/html");
          pipe(body);

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
        },
        onShellError(error: unknown) {
          // React types this as `unknown`, and rejecting with a non-Error loses the stack that
          // makes a shell failure diagnosable at all.
          reject(error instanceof Error ? error : new Error(String(error)));
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          console.error(error);
        },
      },
    );
  });
}
