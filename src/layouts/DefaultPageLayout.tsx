import * as React from "react";
import { Outlet } from "react-router-dom";
import {Box, CircularProgress, Container} from "@mui/material";
import { Header } from "../components/Header";
import {HeaderProvider} from "../context/HeaderContext";

function PageSpinner() {
  return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
  );
}

export function DefaultPageLayout() {
  return (
      <HeaderProvider>
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

          <Header />

          <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <React.Suspense fallback={<PageSpinner />}>
              <Outlet />
            </React.Suspense>
          </Container>
        </Box>
      </HeaderProvider>
  );
}