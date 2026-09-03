import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PostAddIcon from "@mui/icons-material/PostAdd";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

import type { LibraryFilterActions } from "../../../hooks/useLibraryFilters";
import type { LibraryFilters } from "../../../types/LibraryFilters";
import { countActiveFilters } from "../../../types/LibraryFilters";
import { ActiveFilterChips } from "../filters/ActiveFilterChips";

const DEVICE_REQUEST_URL =
  "https://github.com/bramstroker/homeassistant-powercalc/discussions/categories/request-light-models";
const CONTRIBUTION_GUIDE_URL = "https://docs.powercalc.nl/contributing/";

export type LibraryEmptyStateProps = LibraryFilterActions & {
  filters: LibraryFilters;
};

/** Recovery paths for a library search that has filtered every profile out. */
export const LibraryEmptyState = ({ filters, ...actions }: LibraryEmptyStateProps) => {
  const activeCount = countActiveFilters(filters);
  const hasManufacturerFilter = filters.facets.manufacturer.length > 0;

  return (
    <Box
      data-testid="library-empty-state"
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        p: 3,
      }}
    >
      <Paper
        variant="outlined"
        sx={{ width: "100%", maxWidth: 720, mt: { xs: 1, sm: 4 }, p: { xs: 2.5, sm: 4 } }}
      >
        <Stack direction="row" sx={{ alignItems: "flex-start", gap: 2 }}>
          <SearchOffIcon color="primary" sx={{ fontSize: 44, flexShrink: 0 }} />
          <Box>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
              No matching profiles
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              {filters.search
                ? `We could not find a profile matching “${filters.search}” with these filters.`
                : "No profiles match the current combination of filters."}
            </Typography>
          </Box>
        </Stack>

        {activeCount > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography component="h3" variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Adjust your filters
            </Typography>
            <ActiveFilterChips filters={filters} {...actions} />
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 600 }}>
            Try another device identifier
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Search for the exact model ID, a model alias, or the barcode printed on the packaging.
          </Typography>
        </Box>

        {hasManufacturerFilter && (
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => {
              actions.setFacet("manufacturer", []);
            }}
          >
            Search without manufacturer
          </Button>
        )}

        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider" }}>
          <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 600 }}>
            Add this device to the library
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Own this device? Measure its real power use and contribute the profile. You will need
            access to the physical device.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} sx={{ mt: 2, gap: 1.5 }}>
            <Button
              component="a"
              href={CONTRIBUTION_GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<PostAddIcon />}
            >
              Measure and contribute
            </Button>
            <Button
              component="a"
              href={DEVICE_REQUEST_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              endIcon={<OpenInNewIcon />}
            >
              Ask the community instead
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            Community requests depend on another owner having the exact same physical model.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
