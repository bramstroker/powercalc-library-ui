import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { indigo } from "@mui/material/colors";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { ColorModeToggle } from "./ColorModeToggle";
import { ExploreMenu } from "./ExploreMenu";
import { HeaderBrand } from "./HeaderBrand";

export type HeaderProps = {
  /** Rendered in the middle of the toolbar. The library grid passes its search field here. */
  searchSlot?: ReactNode;
  /** Number of profiles currently shown. Omit when the page is not showing a filtered list. */
  resultCount?: number;
  /** Total number of profiles, supplied by pages that already have the library loaded. */
  totalCount?: number;
};

export const Header = ({ searchSlot, resultCount, totalCount }: HeaderProps) => (
  <AppBar
    position="static"
    // Without this MUI overrides the bar with its own dark-scheme background, which now wins over
    // the sx rule because it is applied through a color-scheme selector.
    enableColorOnDark
    // The bar pins its own background, so it must pin the foreground too: the dark scheme's
    // primary.contrastText is deliberately near-black (for filled indigo 300 controls) and would
    // otherwise paint the title and actions black on indigo.
    sx={{ justifyContent: "center", backgroundColor: indigo[700], color: "common.white" }}
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
        <HeaderBrand compactOnMobile={Boolean(searchSlot)} />

        {/* Search takes the space between the brand and the actions on the right. */}
        {searchSlot ? (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              minWidth: 0,
              maxWidth: { sm: 280, md: 360 },
              ml: { sm: 2 },
            }}
          >
            {searchSlot}
          </Box>
        ) : null}

        <Box sx={{ flexGrow: 1 }} />

        {resultCount !== undefined && totalCount !== undefined && (
          <Typography
            noWrap
            role="status"
            aria-live="polite"
            aria-atomic="true"
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {resultCount === totalCount
              ? `${totalCount} profiles`
              : `${resultCount} of ${totalCount} profiles`}
          </Typography>
        )}

        <ExploreMenu />
        <ColorModeToggle />
      </Toolbar>
    </Container>
  </AppBar>
);
