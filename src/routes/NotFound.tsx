import { Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { usePageMeta } from "../hooks/usePageMeta";

export const NotFound = () => {
  usePageMeta({
    title: "Page not found",
    description: "The requested Powercalc library page could not be found.",
    noIndex: true,
  });

  return (
    <>
      <Typography variant="h5">Page not found</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        The requested page does not exist.
      </Typography>
      <Button component={RouterLink} to="/" sx={{ mt: 2 }}>
        Back to the profile library
      </Button>
    </>
  );
};
