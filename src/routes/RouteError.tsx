import { Container, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

import {Header} from "../components/Header";

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
};

export const RouteError = () => {
  const err = useRouteError();

  const message = isRouteErrorResponse(err)
      ? `${err.status} ${err.statusText}`
      : getErrorMessage(err);

  return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />

        <Container maxWidth="lg" sx={{ mt: 4, mb: 8, flex: 1 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography color="text.secondary">{message}</Typography>
        </Container>
      </Box>
  );
}
