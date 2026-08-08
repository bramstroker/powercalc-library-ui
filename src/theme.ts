import { createTheme } from "@mui/material";

/**
 * Both color schemes are defined so the toggle can switch between them at runtime; MUI persists the
 * choice itself. `dark` stays the default (see `defaultMode` on the ThemeProvider in index.tsx).
 *
 * Note: with color schemes enabled, `theme.palette.mode` is not reliable inside `sx` callbacks —
 * use `theme.applyStyles('light', {...})` instead.
 */
export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-mui-color-scheme",
  },
  colorSchemes: {
    dark: {
      palette: {
        primary: { main: "#7986cb" },
        secondary: { main: "#f50057" },
      },
    },
    light: {
      palette: {
        primary: { main: "#3f51b5" },
        secondary: { main: "#f50057" },
      },
    },
  },
});
