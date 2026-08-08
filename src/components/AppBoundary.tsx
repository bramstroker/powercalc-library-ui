import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import * as Sentry from "@sentry/react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { Logo } from "./Logo";

const centred = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
} as const;

const AppLoading = () => (
  <Box sx={centred}>
    <CircularProgress />
    <Typography color="text.secondary">Loading the profile library…</Typography>
  </Box>
);

const AppError = ({ error, onRetry }: { error: unknown; onRetry: () => void }) => (
  <Container maxWidth="sm" sx={centred}>
    <Box sx={{ color: "primary.main" }}>
      <Logo width={56} />
    </Box>
    <Typography variant="h6">The profile library could not be loaded</Typography>
    <Typography color="text.secondary" sx={{ textAlign: "center" }}>
      The Powercalc API did not respond. It may be temporarily unavailable — trying again usually
      helps.
    </Typography>
    <Button variant="contained" startIcon={<RefreshIcon />} onClick={onRetry}>
      Try again
    </Button>
    {error instanceof Error && (
      <Typography variant="caption" color="text.secondary">
        {error.message}
      </Typography>
    )}
  </Container>
);

/**
 * The library is fetched above the router, so a failure there has no route `errorElement` to fall
 * back to and no Suspense boundary to show a spinner — without this the app renders a blank page
 * both while loading and when the API is down.
 */
export const AppBoundary = ({ children }: { children: ReactNode }) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <Sentry.ErrorBoundary
        onReset={reset}
        fallback={({ error, resetError }) => <AppError error={error} onRetry={resetError} />}
      >
        <Suspense fallback={<AppLoading />}>{children}</Suspense>
      </Sentry.ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);
