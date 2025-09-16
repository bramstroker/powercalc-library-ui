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
import { LibraryProvider } from "./context/LibraryContext";
import {queryClient} from "./queryClient";

const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: '#7986cb',
        },
        secondary: {
          main: '#f50057',
        },
      },
    },
  },
  cssVariables: false,
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <LibraryGrid />,
  },
  {
    path: "/profiles/:manufacturer/:model",
    element: <Profile />,
    loader: powerProfileLoader
  },
  {
    path: "/statistics/top-measure-devices",
    element: <TopMeasureDevices />,
  },
  {
    path: "/statistics/top-authors",
    element: <TopAuthors />,
  },
  {
    path: "/statistics/top-manufacturers",
    element: <TopManufacturers />,
  },
  {
    path: "/statistics/top-device-types",
    element: <TopDeviceTypes />,
  },
]);

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);
root.render(
    <ThemeProvider theme={theme} defaultMode="dark">
      <CssBaseline/>
      <QueryClientProvider client={queryClient}>
        <LibraryProvider>
          <RouterProvider router={router} />
        </LibraryProvider>
      </QueryClientProvider>
    </ThemeProvider>
);
