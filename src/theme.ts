import { createTheme } from "@mui/material";

declare module "@mui/material/styles" {
  interface CssThemeVariables {
    enabled: true;
  }
}

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
        // Indigo 300 needs dark foreground content to meet WCAG AA on filled controls.
        primary: { main: "#7986cb", contrastText: "rgba(0, 0, 0, 0.87)" },
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
