import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import * as Sentry from "@sentry/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AppBoundary } from "./components/AppBoundary";
import { LibraryGrid } from "./components/LibraryGrid";
import { LibraryProvider } from "./context/LibraryContext";
import { DefaultPageLayout } from "./layouts/DefaultPageLayout";
import { LibraryGridPageLayout } from "./layouts/LibraryGridPageLayout";
import { powerProfileLoader } from "./loaders/powerProfileLoader";
import { queryClient } from "./queryClient";
import { RouteError } from "./routes/RouteError";
import { theme } from "./theme";


Sentry.init({
  dsn: "https://0d99b37d629842e88ae62be9ecddd530@o4510889348890624.ingest.de.sentry.io/4510889353936976",
  // Leave visitor PII (IP addresses among others) out of error reports — this is a public site
  // with a largely EU audience. Flip to true only with a deliberate privacy decision behind it.
  sendDefaultPii: false,
});

/**
 * Only the grid is bundled eagerly — it is where nearly every visit lands. The statistics and
 * analytics pages carry the chart and date-picker libraries, so loading them on demand keeps them
 * off the critical path.
 */
const lazyRoute = (load: () => Promise<Record<string, React.ComponentType>>, name: string) => async () => {
  const module = await load();
  return { Component: module[name] };
};

const router = createBrowserRouter([
  {
    element: <LibraryGridPageLayout />,
    errorElement: <RouteError />,
    children: [
      {
        path: "/",
        element: <LibraryGrid />,
      },
    ],
  },
  {
    element: <DefaultPageLayout />,
    errorElement: <RouteError />,
    children: [
      {
        path: "/profiles/:manufacturer/:model",
        lazy: lazyRoute(() => import("./components/Profile"), "Profile"),
        loader: powerProfileLoader,
      },
      {
        path: "/statistics/top-measure-devices",
        lazy: lazyRoute(() => import("./components/statistics/TopMeasureDevices"), "TopMeasureDevices"),
      },
      {
        path: "/statistics/top-contributors",
        lazy: lazyRoute(() => import("./components/statistics/TopContributors"), "TopContributors"),
      },
      {
        path: "/statistics/top-manufacturers",
        lazy: lazyRoute(() => import("./components/statistics/TopManufacturers"), "TopManufacturers"),
      },
      {
        path: "/statistics/top-device-types",
        lazy: lazyRoute(() => import("./components/statistics/TopDeviceTypes"), "TopDeviceTypes"),
      },
      {
        path: "/statistics/weekly-contributions",
        lazy: lazyRoute(() => import("./components/statistics/WeeklyContributions"), "WeeklyContributions"),
      },
      {
        path: "/analytics",
        lazy: lazyRoute(() => import("./components/statistics/analytics/AnalyticsOverview"), "AnalyticsOverview"),
      },
      {
        path: "/analytics/sensor-dimensions",
        lazy: lazyRoute(() => import("./components/statistics/analytics/SensorDimensions"), "SensorDimensions"),
      },
      {
        path: "/analytics/sensor-dimensions/:dimension",
        lazy: lazyRoute(() => import("./components/statistics/analytics/SensorDimensions"), "SensorDimensions"),
      },
      {
        path: "/analytics/installations",
        lazy: lazyRoute(() => import("./components/statistics/analytics/Installations"), "Installations"),
      },
      {
        path: "/analytics/profiles",
        lazy: lazyRoute(() => import("./components/statistics/analytics/Profiles"), "Profiles"),
      },
      {
        path: "/analytics/time-series",
        lazy: lazyRoute(() => import("./components/statistics/analytics/TimeSeries"), "TimeSeries"),
      },
      {
        path: "/author/:authorName",
        lazy: lazyRoute(() => import("./components/Author"), "Author"),
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <ThemeProvider theme={theme} defaultMode="dark">
    <CssBaseline enableColorScheme />
    <QueryClientProvider client={queryClient}>
      <AppBoundary>
        <LibraryProvider>
          <RouterProvider router={router} />
        </LibraryProvider>
      </AppBoundary>
    </QueryClientProvider>
  </ThemeProvider>,
);
