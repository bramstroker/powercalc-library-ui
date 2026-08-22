import {Box, CircularProgress, Container} from "@mui/material";
import { Outlet } from "react-router";

import { AppBoundary } from "../components/AppBoundary";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
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

export const DefaultPageLayout = () => {
  return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <ScrollToTop />

        <Header />

        <Container
            maxWidth="lg"
            sx={{
              mt: 4,
              mb: 4,
              flex: 1,
            }}
        >
          <AppBoundary fallback={<PageSpinner />}>
            <Outlet />
          </AppBoundary>
        </Container>

        <Footer />
      </Box>
  );
}
