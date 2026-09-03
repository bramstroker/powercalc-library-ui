import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { useState, type MouseEvent } from "react";
import { Link as RouterLink, useLocation } from "react-router";

import { EXPLORE_NAVIGATION } from "./exploreNavigation";

export const ExploreMenu = () => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);
  const isCurrent = (path: string) => location.pathname === path;

  const menuItemSx = (path: string) => ({
    borderRadius: 1,
    mb: 0.5,
    fontWeight: isCurrent(path) ? 700 : 400,
    bgcolor: isCurrent(path) ? "action.selected" : undefined,
  });

  return (
    <>
      <Tooltip title="Explore">
        <Button
          color="inherit"
          onClick={(event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)}
          startIcon={<ExploreOutlinedIcon />}
          id="explore-button"
          aria-controls={open ? "explore-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          aria-label="Explore"
          sx={{
            minWidth: { xs: 40, sm: 64 },
            px: { xs: 1, sm: 2 },
            "& .MuiButton-startIcon": {
              m: { xs: 0, sm: "0 8px 0 -4px" },
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Explore
          </Box>
          <KeyboardArrowDownIcon sx={{ display: { xs: "none", sm: "block" }, ml: 0.5 }} />
        </Button>
      </Tooltip>

      <Popover
        id="explore-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={close}
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
          {EXPLORE_NAVIGATION.map((section, sectionIndex) => (
            <Box
              key={section.label}
              sx={
                sectionIndex === 0
                  ? undefined
                  : {
                      borderTop: { xs: 1, sm: 0 },
                      borderLeft: { xs: 0, sm: 1 },
                      borderColor: "divider",
                      pt: { xs: 2, sm: 0 },
                      pl: { xs: 0, sm: 2 },
                    }
              }
            >
              <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
                {section.label}
              </Typography>
              {section.description ? (
                <Typography variant="body2" color="text.secondary" sx={{ px: 1, mb: 1 }}>
                  {section.description}
                </Typography>
              ) : null}
              <MenuList disablePadding aria-labelledby="explore-button">
                {section.items.map((item) => (
                  <MenuItem
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    onClick={close}
                    aria-current={isCurrent(item.path) ? "page" : undefined}
                    sx={menuItemSx(item.path)}
                  >
                    <item.icon fontSize="small" sx={{ mr: 1.25 }} />
                    {item.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};
