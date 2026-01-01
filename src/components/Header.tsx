import BarChartIcon from "@mui/icons-material/BarChart";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {Divider, IconButton, Tooltip, useMediaQuery, useTheme} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {indigo} from "@mui/material/colors";
import Container from "@mui/material/Container";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { MRT_TableInstance} from "material-react-table";
import {
  MRT_GlobalFilterTextField, MRT_ShowHideColumnsButton
} from "material-react-table";
import React from "react";
import {Link as RouterLink, useNavigate} from "react-router-dom";

import {useLibrary} from "../context/LibraryContext";
import type {PowerProfile} from "../types/PowerProfile";

import {Logo} from "./Logo";


export type HeaderProps = {
  table?: MRT_TableInstance<PowerProfile>;
};

export const Header = ({
                                 table
                               }: HeaderProps) => {
  const navigate = useNavigate();
  const [statsAnchorEl, setStatsAnchorEl] = React.useState<null | HTMLElement>(null);
  const statsOpen = Boolean(statsAnchorEl);
  const libraryStats = useLibrary()

  const handleStatsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setStatsAnchorEl(event.currentTarget);
  };

  const handleStatsClose = () => {
    setStatsAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    void navigate(path);
    handleStatsClose();
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
      <AppBar
          position="static"
          sx={{justifyContent: "center", backgroundColor: indigo[700]}}
      >
        <Container maxWidth="xl">
          <Toolbar
              disableGutters
              sx={{
                flexDirection: {xs: "column", sm: "row"},
                mb: {xs: 2, sm: 0},
                justifyContent: {xs: "center", sm: "flex-start"},
                alignItems: {sm: "center"},
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
              <Logo width={40}/>

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

              {isMobile ? (
                  <Tooltip title="Statistics">
                    <IconButton
                        color="inherit"
                        onClick={handleStatsClick}
                        id="statistics-button"
                        aria-controls={statsOpen ? "statistics-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={statsOpen ? "true" : undefined}
                        aria-label="Statistics menu"
                    >
                      <BarChartIcon />
                    </IconButton>
                  </Tooltip>
              ) : (
                  <Button
                      color="inherit"
                      sx={{ mr: 2 }}
                      onClick={handleStatsClick}
                      startIcon={<BarChartIcon />}
                      endIcon={<KeyboardArrowDownIcon />}
                      id="statistics-button"
                      aria-controls={statsOpen ? "statistics-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={statsOpen ? "true" : undefined}
                  >
                    Statistics
                  </Button>
              )}

              <Menu
                  id="statistics-menu"
                  anchorEl={statsAnchorEl}
                  open={statsOpen}
                  onClose={handleStatsClose}
                  slotProps={{list: {'aria-labelledby': 'statistics-button'}}}
              >
                <Typography variant="subtitle2" sx={{px: 2, py: 1, fontWeight: 'bold'}}>
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

                <Divider sx={{my: 1}}/>

                <Typography variant="subtitle2" sx={{px: 2, py: 1, fontWeight: 'bold'}}>
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

            {table && (
                <>
                  <Box sx={{flexGrow: 0, display: "flex"}}>
                    <MRT_GlobalFilterTextField table={table} sx={{mr: 2}}/>

                    <MRT_ShowHideColumnsButton table={table}/>
                  </Box>

                  <Box sx={{flexGrow: 0, display: {xs: "none", md: "flex"}}}>
                    <Typography noWrap>
                      {libraryStats.total} profiles
                    </Typography>
                  </Box>
                </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
  );
};
