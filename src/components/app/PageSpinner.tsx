import { Box, CircularProgress, Container } from "@mui/material";
import { useLocation, useNavigation } from "react-router";

/**
 * True only while React Router is moving to a *different* page. Deliberately not any navigation:
 * the library grid pushes its filters into the query string, and flashing a spinner over the
 * results on every checkbox would be worse than showing nothing.
 */
export const useIsChangingPage = () => {
  const navigation = useNavigation();
  const location = useLocation();

  return (
    navigation.state === "loading" &&
    navigation.location !== undefined &&
    navigation.location.pathname !== location.pathname
  );
};

export const PageSpinner = () => (
  <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Box
      sx={{ display: "flex", justifyContent: "center", mt: 8 }}
      role="status"
      aria-label="Loading page"
    >
      <CircularProgress />
    </Box>
  </Container>
);
