import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { RefObject } from "react";

import { CONTRIBUTOR_TIERS } from "../../utils/contributorTier";
import { numberFormat } from "../../utils/formatters";
import { plural } from "../../utils/plural";

import { ContributorCard } from "./ContributorCards";
import type { ContributorSort, ContributorsViewModel } from "./useContributorsViewModel";
import { RECENT_ACTIVITY_DAYS } from "./useContributorsViewModel";

type ContributorDirectoryProps = Pick<
  ContributorsViewModel,
  | "activeOnly"
  | "clearActiveFilter"
  | "loadMore"
  | "search"
  | "setSearch"
  | "setSort"
  | "setTier"
  | "sort"
  | "tier"
  | "totalMatches"
  | "visibleContributors"
  | "visibleCount"
> & { directoryRef: RefObject<HTMLDivElement | null> };

export const ContributorDirectory = ({
  activeOnly,
  clearActiveFilter,
  directoryRef,
  loadMore,
  search,
  setSearch,
  setSort,
  setTier,
  sort,
  tier,
  totalMatches,
  visibleContributors,
  visibleCount,
}: ContributorDirectoryProps) => (
  <Box component="section" aria-labelledby="all-contributors-heading">
    <Typography id="all-contributors-heading" component="h2" variant="h4" sx={{ fontWeight: 750 }}>
      All contributors
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
      Search the community, or browse by tier, profile count, recent activity, or name.
    </Typography>

    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { sm: "center" }, mb: 1.5 }}
    >
      <TextField
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search contributors"
        placeholder="Search contributors"
        size="small"
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ maxWidth: { sm: 360 } }}
      />
      <FormControl size="small" sx={{ minWidth: { sm: 190 } }}>
        <InputLabel id="contributor-sort-label">Sort by</InputLabel>
        <Select
          labelId="contributor-sort-label"
          value={sort}
          label="Sort by"
          onChange={(event) => setSort(event.target.value as ContributorSort)}
        >
          <MenuItem value="profiles">Most profiles</MenuItem>
          <MenuItem value="recent">Recently active</MenuItem>
          <MenuItem value="name">Name A–Z</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: { sm: 160 } }}>
        <InputLabel id="contributor-tier-label">Tier</InputLabel>
        <Select
          labelId="contributor-tier-label"
          value={tier ?? "all"}
          label="Tier"
          onChange={(event) => setTier(event.target.value === "all" ? null : event.target.value)}
        >
          <MenuItem value="all">All tiers</MenuItem>
          {CONTRIBUTOR_TIERS.map((definition) => (
            <MenuItem key={definition.tier} value={definition.tier}>
              {definition.tier}
              {definition === CONTRIBUTOR_TIERS[0] ? "" : " and up"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>

    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ alignItems: "center", flexWrap: "wrap", mb: 2 }}
    >
      <Typography variant="body2" color="text.secondary" aria-live="polite">
        {plural(totalMatches, "contributor")}
      </Typography>
      {activeOnly && (
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={`Active in the last ${RECENT_ACTIVITY_DAYS} days`}
          onDelete={clearActiveFilter}
        />
      )}
    </Stack>

    {totalMatches === 0 ? (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Typography component="h3" variant="h6">
          No contributors found
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          No names or GitHub handles match &quot;{search}&quot;.
        </Typography>
      </Paper>
    ) : (
      <>
        <Grid container spacing={2} ref={directoryRef} data-testid="contributor-directory">
          {visibleContributors.map((summary) => (
            <Grid key={summary.author.githubUsername} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ContributorCard summary={summary} />
            </Grid>
          ))}
        </Grid>

        {visibleCount < totalMatches && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button variant="outlined" onClick={loadMore}>
              Load more ({numberFormat.format(totalMatches - visibleCount)} to go)
            </Button>
          </Box>
        )}
      </>
    )}
  </Box>
);
