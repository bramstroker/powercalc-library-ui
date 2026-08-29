import { isRouteErrorResponse, type ClientLoaderFunctionArgs } from "react-router";

type Loader<T> = (args: ClientLoaderFunctionArgs) => Promise<T>;

const isMissingPrerenderData = (error: unknown) =>
  (error instanceof Response && error.status === 404) ||
  (isRouteErrorResponse(error) && error.status === 404);

export const loadPrerenderedOrLive = async <T>(
  args: ClientLoaderFunctionArgs,
  loader: Loader<T>,
) => {
  try {
    return (await args.serverLoader()) as T;
  } catch (error) {
    // A route added to the API after the latest static build has no generated `.data` file yet.
    // Resolve it directly from the APIs so it already works for users; the next refresh turns
    // it into a normal prerendered page. Preserve every other server-loader failure as a real error.
    if (!isMissingPrerenderData(error)) throw error;
    return loader(args);
  }
};

/**
 * Builds the `clientLoader` for a route whose data is normally prerendered.
 *
 * It resolves route data from the cheapest source available, which differs per environment and per
 * navigation — the loader itself is a live fallback everywhere, not a development-only path:
 *
 * - Production, first load of a prerendered page: `hydrate` is false, so this never runs and the
 *   loader data embedded in the static document is reused as-is.
 * - Production, client-side navigation: reads the generated `.data` file, and runs `loader` against
 *   the live API when that file is missing because the route postdates the last build.
 * - Development: nothing is prerendered, so `loader` runs in the browser on every navigation and on
 *   hydration.
 */
export const prerenderedOrLiveClientLoader = <T>(loader: Loader<T>) => {
  const clientLoader = (args: ClientLoaderFunctionArgs) =>
    import.meta.env.DEV ? loader(args) : loadPrerenderedOrLive(args, loader);

  // Only development needs the loader to run during hydration; a production document already
  // carries its result, and rerunning it there would refetch the whole library for nothing.
  clientLoader.hydrate = import.meta.env.DEV;

  return clientLoader;
};
