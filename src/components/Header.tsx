import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Logo from "./Logo";
import {
  MRT_GlobalFilterTextField,
  MRT_TableInstance,
} from "material-react-table";
import { PowerProfile } from "../types/PowerProfile";
import { useColorScheme } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTheme } from "@mui/material";
import {indigo} from "@mui/material/colors";

type HeaderProps = {
  total?: number;
  table?: MRT_TableInstance<PowerProfile>;
};

export function Header({ total, table }: HeaderProps) {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();

  return (
    <AppBar
      position="static"
      enableColorOnDark
      sx={{ justifyContent: "center", backgroundColor: indigo[700] }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            [theme.breakpoints.only("xs")]: {
              flexDirection: "column",
              marginBottom: "15px",
              justifyContent: "center",
            },
            [theme.breakpoints.up("sm")]: {
              flexDirection: "row",
              alignItems: "center",
            },
          }}
        >
          <Box
            sx={{
              m: 2,
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Logo width={40} />

            <Typography
              variant="h6"
              noWrap
              sx={{
                ml: 2,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
                flexGrow: 1,
              }}
            >
              Profile Library
            </Typography>
          </Box>

          { table && <MRT_GlobalFilterTextField table={table} sx={{ mr: 2 }} /> }

          { table && <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
            <Typography noWrap>{total} profiles</Typography>
          </Box> }

          <IconButton
            sx={{
              ml: 1,
              display: { xs: "none", sm: "flex" },
            }}
            onClick={() => {
              setMode(mode === "light" ? "dark" : "light");
            }}
            color="inherit"
          >
            {mode === "light" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
