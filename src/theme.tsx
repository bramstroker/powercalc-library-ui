import { blue } from '@mui/material/colors';
import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#009485',
        },
      }
    },
    dark: {
      palette: {
        primary: {
          main: blue[900],
        },
      }
    }
  }
});

export default theme;