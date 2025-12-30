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
import { useTheme } from "@mui/material";
import {indigo} from "@mui/material/colors";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import Logo from "./Logo";
import {useHeader} from "../context/HeaderContext";
import {useLibrary} from "../context/LibraryContext";

export function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { config } = useHeader();
  const libraryStats = useLibrary()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    handleClose();
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
              onClick={handleClick}
              endIcon={<KeyboardArrowDownIcon />}
              startIcon={<BarChartIcon />}
            >
              Statistics
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{ list: { 'aria-labelledby': 'statistics-button' } }}
            >
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
              <MenuItem onClick={() => handleMenuItemClick('/analytics/sensor-dimensions')}>
                Sensor usage
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/analytics/installations')}>
                Installation statistics
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/analytics/profiles')}>
                Profile usage
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/analytics/optins')}>
                Opt-ins Over Time
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
