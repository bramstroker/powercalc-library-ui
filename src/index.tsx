import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Profile from "./components/Profile";
import {powerProfileLoader} from "./loaders/powerProfileLoader";
import LibraryGrid from "./components/LibraryGrid";
import {createTheme} from "@mui/material";
import {ThemeProvider} from "@mui/material/styles";

const theme2 = createTheme({
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
  cssVariables: true,
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
]);

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);
root.render(
    <ThemeProvider theme={theme2} defaultMode="dark">
      <CssBaseline/>
      <RouterProvider router={router}/>
    </ThemeProvider>
);
