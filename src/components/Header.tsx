import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Logo from './Logo';
import {MRT_GlobalFilterTextField, MRT_TableInstance} from 'material-react-table';
import {PowerProfile} from '../types/PowerProfile'
import {useColorScheme} from '@mui/material/styles';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

type HeaderProps = {
    total: number;
    table: MRT_TableInstance<PowerProfile>;
};

export function Header({total, table}: HeaderProps) {
  const { mode, setMode } = useColorScheme();
  return (
    <Box sx={{ flexGrow: 1 }}>
    <AppBar position="static" enableColorOnDark>
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          <Box sx={{ m: 2 }}><Logo width={40} /></Box>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              //display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1
            }}
          >
            Powercalc Profile Library
          </Typography>
          <MRT_GlobalFilterTextField table={table} sx={{ mr: 2 }} />

          <Typography>{total} profiles</Typography>
          <IconButton sx={{ ml: 1 }} onClick={() => {
        setMode(mode === 'light' ? 'dark' : 'light');
      }}
    color="inherit">
      {mode === 'light' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
    </Box>
  );
}
