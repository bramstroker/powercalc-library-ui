import { createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import * as Sentry from "@sentry/react";
import { QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Author } from "./components/Author";
import { LibraryGrid } from "./components/LibraryGrid";
import { Profile } from "./components/Profile";
import { AnalyticsOverview } from "./components/statistics/analytics/AnalyticsOverview";
import { Installations } from "./components/statistics/analytics/Installations";
import { Profiles } from "./components/statistics/analytics/Profiles";
import { SensorDimensions } from "./components/statistics/analytics/SensorDimensions";
import { TimeSeries } from "./components/statistics/analytics/TimeSeries";
import { TopContributors } from "./components/statistics/TopContributors";
import { TopDeviceTypes } from "./components/statistics/TopDeviceTypes";
import { TopManufacturers } from "./components/statistics/TopManufacturers";
import { TopMeasureDevices } from "./components/statistics/TopMeasureDevices";
import { WeeklyContributions } from "./components/statistics/WeeklyContributions";
import { LibraryProvider } from "./context/LibraryContext";
import { DefaultPageLayout } from "./layouts/DefaultPageLayout";
import { LibraryGridPageLayout } from "./layouts/LibraryGridPageLayout";
import { powerProfileLoader } from "./loaders/powerProfileLoader";
import { queryClient } from "./queryClient";
import { RouteError } from "./routes/RouteError";


Sentry.init({
  dsn: "https://0d99b37d629842e88ae62be9ecddd530@o4510889348890624.ingest.de.sentry.io/4510889353936976",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

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
        element: <Profile />,
        loader: powerProfileLoader,
      },
      {
        path: "/statistics/top-measure-devices",
        element: <TopMeasureDevices />,
      },
      {
        path: "/statistics/top-contributors",
        element: <TopContributors />,
      },
      {
        path: "/statistics/top-manufacturers",
        element: <TopManufacturers />,
      },
      {
        path: "/statistics/top-device-types",
        element: <TopDeviceTypes />,
      },
      {
        path: "/statistics/weekly-contributions",
        element: <WeeklyContributions />,
      },
      {
        path: "/analytics",
        element: <AnalyticsOverview />,
      },
      {
        path: "/analytics/sensor-dimensions",
        element: <SensorDimensions />,
      },
      {
        path: "/analytics/sensor-dimensions/:dimension",
        element: <SensorDimensions />,
      },
      {
        path: "/analytics/installations",
        element: <Installations />,
      },
      {
        path: "/analytics/profiles",
        element: <Profiles />,
      },
      {
        path: "/analytics/time-series",
        element: <TimeSeries />,
      },
      {
        path: "/author/:authorName",
        element: <Author />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: {
      main: "#7986cb",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline enableColorScheme />
    <QueryClientProvider client={queryClient}>
      <LibraryProvider>
        <RouterProvider router={router} />
      </LibraryProvider>
    </QueryClientProvider>
  </ThemeProvider>,
);
