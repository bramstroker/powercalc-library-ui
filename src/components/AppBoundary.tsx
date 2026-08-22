import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Container, Typography } from "@mui/material";
import * as Sentry from "@sentry/react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { Logo } from "./Logo";

const centred = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
} as const;

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
 * Renders inside each layout, not at the root: a React error boundary only catches errors from
 * below it, so at the root this sat *above* every layout route's own `ErrorBoundary` and a failing
 * library query reached the generic route error page instead of this retryable one.
 *
 * Error handling only — it deliberately holds no `<Suspense>`. One wrapping `<Outlet />` makes
 * React Router's route rendering suspend against it, which pushes the whole prerendered page behind
 * a JavaScript swap. Loading states come from `useIsChangingPage` instead.
 */
export const AppBoundary = ({ children }: { children: ReactNode }) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <Sentry.ErrorBoundary
        onReset={reset}
        fallback={({ error, resetError }) => <AppError error={error} onRetry={resetError} />}
      >
        {children}
      </Sentry.ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);
