import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Container, Typography } from "@mui/material";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Component, type ErrorInfo, type ReactNode } from "react";

import { reportError } from "../../sentry";
import { Logo } from "../shared/Logo";

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
 * Stands in for `Sentry.ErrorBoundary`, which would pull the SDK into the client entry and back
 * onto the critical path. Reporting goes through `reportError`, which loads Sentry on demand.
 */
class ReportingErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void; fallback: (props: FallbackProps) => ReactNode },
  { error: unknown }
> {
  state: { error: unknown } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    reportError(error, info.componentStack);
  }

  resetError = () => {
    this.setState({ error: null });
    this.props.onReset();
  };

  render() {
    if (this.state.error === null) return this.props.children;

    return this.props.fallback({ error: this.state.error, resetError: this.resetError });
  }
}

type FallbackProps = { error: unknown; resetError: () => void };

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
      <ReportingErrorBoundary
        onReset={reset}
        fallback={({ error, resetError }) => <AppError error={error} onRetry={resetError} />}
      >
        {children}
      </ReportingErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);
