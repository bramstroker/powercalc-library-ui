import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {createTheme} from "@mui/material";
import {ThemeProvider} from "@mui/material/styles";
import {QueryClientProvider} from "@tanstack/react-query";

import Profile from "./components/Profile";
import {powerProfileLoader} from "./loaders/powerProfileLoader";
import LibraryGrid from "./components/LibraryGrid";
import TopMeasureDevices from "./components/statistics/TopMeasureDevices";
import TopAuthors from "./components/statistics/TopAuthors";
import TopManufacturers from "./components/statistics/TopManufacturers";
import TopDeviceTypes from "./components/statistics/TopDeviceTypes";
import SensorDimensions from "./components/statistics/analytics/SensorDimensions";
import Installations from "./components/statistics/analytics/Installations";
import Profiles from "./components/statistics/analytics/Profiles";
import AnalyticsOverview from "./components/statistics/analytics/AnalyticsOverview";
import {LibraryProvider} from "./context/LibraryContext";
import {queryClient} from "./queryClient";
import {DefaultPageLayout} from "./layouts/DefaultPageLayout";
import {RouteError} from "./routes/RouteError";
import {FullWidthPageLayout} from "./layouts/FullWidthPageLayout";

const router = createBrowserRouter([
  {
    element: <FullWidthPageLayout/>,
    errorElement: <RouteError />,
    children: [
      {
        path: "/",
        element: <LibraryGrid/>,
      },
    ]
  },
  {
    element: <DefaultPageLayout/>,
    errorElement: <RouteError />,
    children: [
      {
        path: "/profiles/:manufacturer/:model",
        element: <Profile/>,
        loader: powerProfileLoader
      },
      {
        path: "/statistics/top-measure-devices",
        element: <TopMeasureDevices/>,
      },
      {
        path: "/statistics/top-authors",
        element: <TopAuthors/>,
      },
      {
        path: "/statistics/top-manufacturers",
        element: <TopManufacturers/>,
      },
      {
        path: "/statistics/top-device-types",
        element: <TopDeviceTypes/>,
      },
      {
        path: "/analytics",
        element: <AnalyticsOverview/>,
      },
      {
        path: "/analytics/sensor-dimensions",
        element: <SensorDimensions/>,
      },
      {
        path: "/analytics/sensor-dimensions/:dimension",
        element: <SensorDimensions/>,
      },
      {
        path: "/analytics/installations",
        element: <Installations/>,
      },
      {
        path: "/analytics/profiles",
        element: <Profiles/>,
      }]
  }]);

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);


const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: '#7986cb',
    },
    secondary: {
      main: '#f50057',
    },
  }
});

root.render(
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme/>
      <QueryClientProvider client={queryClient}>
        <LibraryProvider>
          <RouterProvider router={router}/>
        </LibraryProvider>
      </QueryClientProvider>
    </ThemeProvider>
);
