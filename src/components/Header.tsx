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
  MRT_TableInstance,
} from "material-react-table";
import { useTheme } from "@mui/material";
import {indigo} from "@mui/material/colors";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { PowerProfile } from "../types/PowerProfile";

import Logo from "./Logo";

type HeaderProps = {
  total?: number;
  table?: MRT_TableInstance<PowerProfile>;
};

export function Header({ total, table }: HeaderProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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
              MenuListProps={{
                'aria-labelledby': 'statistics-button',
              }}
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
            </Menu>
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
