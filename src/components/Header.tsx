import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Logo from "./Logo";
import {
  MRT_GlobalFilterTextField, MRT_ShowHideColumnsButton,
  MRT_TableInstance,
} from "material-react-table";
import { PowerProfile } from "../types/PowerProfile";
import { useTheme } from "@mui/material";
import {indigo} from "@mui/material/colors";

type HeaderProps = {
  total?: number;
  table?: MRT_TableInstance<PowerProfile>;
};

export function Header({ total, table }: HeaderProps) {
  const theme = useTheme();

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

          { table && <MRT_ShowHideColumnsButton table={table} /> }

          { table && <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
            <Typography noWrap>{total} profiles</Typography>
          </Box> }
        </Toolbar>
      </Container>
    </AppBar>
  );
}
