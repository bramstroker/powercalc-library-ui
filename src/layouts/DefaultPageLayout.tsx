import { Box, Container } from "@mui/material";
import { Outlet } from "react-router";

import { AppBoundary } from "../components/AppBoundary";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { PageSpinner, useIsChangingPage } from "../components/PageSpinner";
import { ScrollToTop } from "../components/ScrollToTop";

export const DefaultPageLayout = () => {
  // Driven by the router rather than a Suspense boundary. A `<Suspense>` wrapping `<Outlet />` makes
  // React Router's route rendering suspend against it, and every prerendered document then ships the
  // fallback inline with the real page in a trailing `<div hidden>` for a `$RC` script to swap in —
  // so anything that does not run JavaScript sees only this spinner.
  const isChangingPage = useIsChangingPage();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <ScrollToTop />

      <Header />

      <Container id="main-content" component="main" maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <AppBoundary>{isChangingPage ? <PageSpinner /> : <Outlet />}</AppBoundary>
      </Container>

      <Footer />
    </Box>
  );
};
