import {Box, CircularProgress, Container} from "@mui/material";
import * as React from "react";
import {Outlet} from "react-router-dom";

function PageSpinner() {
  return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
  );
}

export function LibraryGridPageLayout() {
  return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Box>
          <React.Suspense fallback={<PageSpinner />}>
            <Outlet />
          </React.Suspense>
        </Box>
      </Box>
  );
}