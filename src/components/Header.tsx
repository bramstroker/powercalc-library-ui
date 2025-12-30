import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import BarChartIcon from "@mui/icons-material/BarChart";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  MRT_GlobalFilterTextField, MRT_ShowHideColumnsButton,
} from "material-react-table";
import { useTheme, Divider } from "@mui/material";
import {indigo} from "@mui/material/colors";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import Logo from "./Logo";
import {useHeader} from "../context/HeaderContext";
import {useLibrary} from "../context/LibraryContext";

export function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [statsAnchorEl, setStatsAnchorEl] = React.useState<null | HTMLElement>(null);
  const statsOpen = Boolean(statsAnchorEl);
  const { config } = useHeader();
  const libraryStats = useLibrary()

  const handleStatsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setStatsAnchorEl(event.currentTarget);
  };

  const handleStatsClose = () => {
    setStatsAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    handleStatsClose();
  };

  return (
    <AppBar
      position="static"
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
              component={RouterLink}
              to="/"
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

            <Button
              color="inherit"
              sx={{ mr: 2 }}
              onClick={handleStatsClick}
              endIcon={<KeyboardArrowDownIcon />}
              startIcon={<BarChartIcon />}
              id="statistics-button"
              aria-controls={statsOpen ? 'statistics-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={statsOpen ? 'true' : undefined}
            >
              Statistics
            </Button>
            <Menu
              id="statistics-menu"
              anchorEl={statsAnchorEl}
              open={statsOpen}
              onClose={handleStatsClose}
              slotProps={{ list: { 'aria-labelledby': 'statistics-button' } }}
            >
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
                Library stats
              </Typography>
              <MenuItem onClick={() => handleMenuItemClick('/statistics/top-measure-devices')}>
                Top Measure Devices
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/statistics/top-authors')}>
                Top Authors
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/statistics/top-manufacturers')}>
                Top Manufacturers
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/statistics/top-device-types')}>
                Top Device Types
              </MenuItem>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
                Insights
              </Typography>
              <MenuItem onClick={() => handleMenuItemClick('/analytics/sensor-dimensions')}>
                Sensor usage
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/analytics/installations')}>
                Installation statistics
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/analytics/profiles')}>
                Profile usage
              </MenuItem>
            </Menu>
          </Box>

          { config.libraryGrid && <MRT_GlobalFilterTextField table={config.libraryGrid} sx={{ mr: 2 }} /> }

          { config.libraryGrid && <MRT_ShowHideColumnsButton table={config.libraryGrid} /> }

          { config.libraryGrid && <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
            <Typography noWrap>{libraryStats.total} profiles</Typography>
          </Box> }
        </Toolbar>
      </Container>
    </AppBar>
  );
}
