import { Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

export const NotFound = () => {
  return (
    <>
      <Typography variant="h5" component="h1">
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        The requested page does not exist.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
        <Button component={RouterLink} to="/" variant="contained">
          Browse profiles
        </Button>
        <Button component={RouterLink} to="/statistics">
          View statistics
        </Button>
        <Button component={RouterLink} to="/analytics">
          View analytics
        </Button>
      </Stack>
    </>
  );
};
