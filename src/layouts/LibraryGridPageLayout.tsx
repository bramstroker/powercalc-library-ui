import {Box, CircularProgress, Container} from "@mui/material";
import {Outlet} from "react-router";

import { AppBoundary } from "../components/AppBoundary";
import { Footer } from "../components/Footer";
import { ScrollToTop } from "../components/ScrollToTop";

const PageSpinner = () => {
  return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
  );
}

/**
 * App-shell layout for the grid: on desktop the page never scrolls, the grid scrolls internally and
 * the footer stays pinned. On phones a pinned footer costs ~17% of the viewport for links nobody is
 * looking for, so there the page scrolls normally and the footer sits below the results.
 *
 * The children rely on this being a flex column with a definite height so the grid can size itself.
 */
export const LibraryGridPageLayout = () => {
  return (
      <Box
          sx={{
            height: { xs: "auto", md: "100dvh" },
            minHeight: { xs: "100dvh", md: "auto" },
            display: "flex",
            flexDirection: "column",
            overflow: { xs: "visible", md: "hidden" },
          }}
      >
        <ScrollToTop />
        <AppBoundary fallback={<PageSpinner />}>
          <Outlet />
        </AppBoundary>
        <Footer />
      </Box>
  );
}
