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
import React from "react";
import {Link as RouterLink, useNavigate} from "react-router-dom";

import {useLibrary} from "../context/LibraryContext";

import {ColorModeToggle} from "./ColorModeToggle";
import {Logo} from "./Logo";


export type HeaderProps = {
  /** Rendered in the middle of the toolbar. The library grid passes its search field here. */
  searchSlot?: React.ReactNode;
  /** Number of profiles currently shown. Omit when the page is not showing a filtered list. */
  resultCount?: number;
};

export const Header = ({
                         searchSlot,
                         resultCount,
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
          // Without this MUI overrides the bar with its own dark-scheme background, which now wins
          // over the sx rule because it is applied through a color-scheme selector.
          enableColorOnDark
          sx={{justifyContent: "center", backgroundColor: indigo[700]}}
      >
        <Container maxWidth="xl">
          <Toolbar
              disableGutters
              sx={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 1,
              }}
          >
            <Box
                component={RouterLink}
                to="/"
                sx={{
                  my: {xs: 1, sm: 2},
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  // The logo inherits its fill, and this anchor would otherwise tint it with the
                  // default link colour instead of the app bar's white.
                  color: 'inherit',
                  minWidth: 0,
                }}
            >
                <Logo width={40}/>

              <Box
                  sx={{
                    ml: 2,
                    minWidth: 0,
                    // On a phone the search field takes the row, so the wordmark stands down —
                    // but without it the bar is just icons floating in empty space.
                    display: {xs: searchSlot ? "none" : "block", md: "block"},
                  }}
              >
                <Typography
                    variant="h6"
                    component="span"
                    noWrap
                    sx={{
                      display: "block",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      letterSpacing: ".2rem",
                      lineHeight: 1.15,
                    }}
                >
                  Powercalc
                </Typography>
                <Typography
                    variant="caption"
                    component="span"
                    noWrap
                    sx={{display: "block", opacity: 0.75, letterSpacing: ".12em"}}
                >
                  Profile Library
                </Typography>
              </Box>
            </Box>

            {/* Search takes the space between the brand and the actions on the right. */}
            {searchSlot ? (
                <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      minWidth: 0,
                      maxWidth: {sm: 280, md: 360},
                      ml: {sm: 2},
                    }}
                >
                  {searchSlot}
                </Box>
            ) : null}

            <Box sx={{flexGrow: 1}}/>

            {resultCount !== undefined && (
                <Typography noWrap sx={{display: {xs: "none", md: "block"}}}>
                  {resultCount === libraryStats.total
                      ? `${libraryStats.total} profiles`
                      : `${resultCount} of ${libraryStats.total} profiles`}
                </Typography>
            )}

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
                    <BarChartIcon/>
                  </IconButton>
                </Tooltip>
            ) : (
                <Button
                    color="inherit"
                    onClick={handleStatsClick}
                    startIcon={<BarChartIcon/>}
                    endIcon={<KeyboardArrowDownIcon/>}
                    id="statistics-button"
                    aria-controls={statsOpen ? "statistics-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={statsOpen ? "true" : undefined}
                >
                  Insights
                </Button>
            )}

            <Menu
                id="statistics-menu"
                anchorEl={statsAnchorEl}
                open={statsOpen}
                onClose={handleStatsClose}
                slotProps={{list: {'aria-labelledby': 'statistics-button'}}}
            >
              <Typography
                  variant="subtitle2"
                  sx={{px: 2, py: 1, fontWeight: 'bold', cursor: 'pointer'}}
                  onClick={() => handleMenuItemClick('/analytics')}
              >
                Usage stats
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

              <Divider sx={{my: 1}}/>

              <MenuItem onClick={() => handleMenuItemClick('/whats-new')}>
                What&apos;s new
              </MenuItem>

              <Divider sx={{my: 1}}/>

              <Typography variant="subtitle2" sx={{px: 2, py: 1, fontWeight: 'bold'}}>
                Library stats
              </Typography>
              <MenuItem onClick={() => handleMenuItemClick('/statistics/top-measure-devices')}>
                Top Measure Devices
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/statistics/top-contributors')}>
                Top Contributors
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/statistics/top-manufacturers')}>
                Top Manufacturers
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/statistics/top-device-types')}>
                Top Device Types
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/statistics/weekly-contributions')}>
                Weekly Contributions
              </MenuItem>
            </Menu>

            <ColorModeToggle/>
          </Toolbar>
        </Container>
      </AppBar>
  );
};
