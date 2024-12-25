import { indigo, teal } from "@mui/material/colors";
import { extendTheme } from "@mui/material/styles";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: teal[500],
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: indigo[700],
        },
      },
    },
  },
});

export default theme;
