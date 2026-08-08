import {Box, CircularProgress, Container} from "@mui/material";
import * as React from "react";
import {Outlet} from "react-router-dom";

import { Footer } from "../components/Footer";

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
 * App-shell layout for the grid: the page itself never scrolls, the grid scrolls internally and the
 * footer stays pinned to the bottom. The children rely on this being a flex column with a definite
 * height so the DataGrid can size itself.
 */
export const LibraryGridPageLayout = () => {
  return (
      <Box sx={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <React.Suspense fallback={<PageSpinner />}>
          <Outlet />
        </React.Suspense>
        <Footer />
      </Box>
  );
}
