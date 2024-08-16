import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme2';
import {Experimental_CssVarsProvider as CssVarsProvider} from '@mui/material/styles';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <CssVarsProvider theme={theme} defaultMode="system">
    <CssBaseline />
    <App />
  </CssVarsProvider>,
);
