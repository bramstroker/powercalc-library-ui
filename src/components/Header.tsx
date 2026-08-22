import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import { Tooltip } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {indigo} from "@mui/material/colors";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React from "react";
import { Link as RouterLink, useLocation } from "react-router";

import {ColorModeToggle} from "./ColorModeToggle";
import {Logo} from "./Logo";


export type HeaderProps = {
  /** Rendered in the middle of the toolbar. The library grid passes its search field here. */
  searchSlot?: React.ReactNode;
  /** Number of profiles currently shown. Omit when the page is not showing a filtered list. */
  resultCount?: number;
  /** Total number of profiles, supplied by pages that already have the library loaded. */
  totalCount?: number;
};

export const Header = ({
                         searchSlot,
                         resultCount,
                         totalCount,
                       }: HeaderProps) => {
  const location = useLocation();
  const [exploreAnchorEl, setExploreAnchorEl] = React.useState<null | HTMLElement>(null);
  const exploreOpen = Boolean(exploreAnchorEl);

  const handleExploreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExploreAnchorEl(event.currentTarget);
  };

  const handleExploreClose = () => {
    setExploreAnchorEl(null);
  };

  const isCurrent = (path: string) => location.pathname === path;

  const menuItemSx = (path: string) => ({
    borderRadius: 1,
    mb: 0.5,
    fontWeight: isCurrent(path) ? 700 : 400,
    bgcolor: isCurrent(path) ? "action.selected" : undefined,
  });

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

            {resultCount !== undefined && totalCount !== undefined && (
                <Typography noWrap sx={{display: {xs: "none", md: "block"}}}>
                  {resultCount === totalCount
                      ? `${totalCount} profiles`
                      : `${resultCount} of ${totalCount} profiles`}
                </Typography>
            )}

            <Tooltip title="Explore">
                <Button
                    color="inherit"
                    onClick={handleExploreClick}
                    startIcon={<ExploreOutlinedIcon/>}
                    id="explore-button"
                    aria-controls={exploreOpen ? "explore-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={exploreOpen ? "true" : undefined}
                    aria-label="Explore"
                    sx={{
                      minWidth: {xs: 40, sm: 64},
                      px: {xs: 1, sm: 2},
                      "& .MuiButton-startIcon": {
                        m: {xs: 0, sm: "0 8px 0 -4px"},
                      },
                    }}
                >
                  <Box component="span" sx={{display: {xs: "none", sm: "inline"}}}>
                    Explore
                  </Box>
                  <KeyboardArrowDownIcon sx={{display: {xs: "none", sm: "block"}, ml: 0.5}}/>
                </Button>
            </Tooltip>

            <Popover
                id="explore-menu"
                anchorEl={exploreAnchorEl}
                open={exploreOpen}
                onClose={handleExploreClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1,
                      width: { xs: "calc(100vw - 16px)", sm: 680 },
                      maxWidth: "calc(100vw - 16px)",
                      maxHeight: "calc(100vh - 80px)",
                    },
                  },
                }}
            >
              <Box
                  component="nav"
                  aria-label="Explore Powercalc"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1.35fr 1fr 1fr" },
                    gap: { xs: 1, sm: 2 },
                    p: 2,
                  }}
              >
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
                    Library
                  </Typography>
                  <MenuList disablePadding aria-labelledby="explore-button">
                    <MenuItem
                        component={RouterLink}
                        to="/"
                        onClick={handleExploreClose}
                        aria-current={isCurrent("/") ? "page" : undefined}
                        sx={menuItemSx("/")}
                    >
                      <LibraryBooksOutlinedIcon fontSize="small" sx={{ mr: 1.25 }} />
                      Browse profiles
                    </MenuItem>
                    <MenuItem
                        component={RouterLink}
                        to="/manufacturers"
                        onClick={handleExploreClose}
                        aria-current={isCurrent("/manufacturers") ? "page" : undefined}
                        sx={menuItemSx("/manufacturers")}
                    >
                      <FactoryOutlinedIcon fontSize="small" sx={{ mr: 1.25 }} />
                      Manufacturers
                    </MenuItem>
                    <MenuItem
                        component={RouterLink}
                        to="/contributors"
                        onClick={handleExploreClose}
                        aria-current={isCurrent("/contributors") ? "page" : undefined}
                        sx={menuItemSx("/contributors")}
                    >
                      <GroupOutlinedIcon fontSize="small" sx={{ mr: 1.25 }} />
                      Contributors
                    </MenuItem>
                    <MenuItem
                        component={RouterLink}
                        to="/whats-new"
                        onClick={handleExploreClose}
                        aria-current={isCurrent("/whats-new") ? "page" : undefined}
                        sx={menuItemSx("/whats-new")}
                    >
                      <NewReleasesOutlinedIcon fontSize="small" sx={{ mr: 1.25 }} />
                      What&apos;s new
                    </MenuItem>
                  </MenuList>
                </Box>

                <Box
                    sx={{
                      borderTop: { xs: 1, sm: 0 },
                      borderLeft: { xs: 0, sm: 1 },
                      borderColor: "divider",
                      pt: { xs: 2, sm: 0 },
                      pl: { xs: 0, sm: 2 },
                    }}
                >
                  <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
                    Statistics
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ px: 1, mb: 1 }}>
                    Library rankings and contribution trends.
                  </Typography>
                  <MenuList disablePadding aria-labelledby="explore-button">
                    <MenuItem
                        component={RouterLink}
                        to="/statistics"
                        onClick={handleExploreClose}
                        aria-current={isCurrent("/statistics") ? "page" : undefined}
                        sx={menuItemSx("/statistics")}
                    >
                      <BarChartIcon fontSize="small" sx={{ mr: 1.25 }} />
                      View statistics
                    </MenuItem>
                  </MenuList>
                </Box>

                <Box
                    sx={{
                      borderTop: { xs: 1, sm: 0 },
                      borderLeft: { xs: 0, sm: 1 },
                      borderColor: "divider",
                      pt: { xs: 2, sm: 0 },
                      pl: { xs: 0, sm: 2 },
                    }}
                >
                  <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
                    Usage analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ px: 1, mb: 1 }}>
                    Opt-in installation and profile usage data.
                  </Typography>
                  <MenuList disablePadding aria-labelledby="explore-button">
                    <MenuItem
                        component={RouterLink}
                        to="/analytics"
                        onClick={handleExploreClose}
                        aria-current={isCurrent("/analytics") ? "page" : undefined}
                        sx={menuItemSx("/analytics")}
                    >
                      <AnalyticsOutlinedIcon fontSize="small" sx={{ mr: 1.25 }} />
                      View analytics
                    </MenuItem>
                  </MenuList>
                </Box>
              </Box>
            </Popover>

            <ColorModeToggle/>
          </Toolbar>
        </Container>
      </AppBar>
  );
};
