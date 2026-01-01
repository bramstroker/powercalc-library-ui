import {Box, CircularProgress, Container} from "@mui/material";
import * as React from "react";
import { Outlet } from "react-router-dom";

import { Header } from "../components/Header";

const PageSpinner = () => {
  return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
  );
}

export const DefaultPageLayout = () => {
  return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        <Header />

        <Container
            maxWidth="lg"
            sx={{
              mt: 4,
              mb: 4,
            }}
        >
          <React.Suspense fallback={<PageSpinner />}>
            <Outlet />
          </React.Suspense>
        </Container>
      </Box>
  );
}