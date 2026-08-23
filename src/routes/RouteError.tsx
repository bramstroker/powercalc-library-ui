import { Button, Container, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useRouteError, isRouteErrorResponse } from "react-router";

import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { usePageMeta } from "../hooks/usePageMeta";

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
};

export const RouteError = () => {
  const err = useRouteError();
  const isNotFound = isRouteErrorResponse(err) && err.status === 404;

  usePageMeta({
    title: isNotFound ? "Page not found" : "Something went wrong",
    description: isNotFound
      ? "The requested Powercalc library page could not be found."
      : "The Powercalc library page could not be loaded.",
    noIndex: true,
  });

  const message = isRouteErrorResponse(err)
    ? `${err.status} ${err.statusText}`
    : getErrorMessage(err);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Container id="main-content" component="main" maxWidth="lg" sx={{ mt: 4, mb: 8, flex: 1 }}>
        <Typography variant="h5" component="h1" color="error" gutterBottom>
          {isNotFound ? "Page not found" : "Something went wrong"}
        </Typography>
        <Typography color="text.secondary">{message}</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
          {!isNotFound && (
            <Button variant="contained" onClick={() => window.location.reload()}>
              Try again
            </Button>
          )}
          <Button href="/">Back to the profile library</Button>
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
};
