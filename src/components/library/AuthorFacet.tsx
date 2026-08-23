import PersonIcon from "@mui/icons-material/Person";
import {
  Autocomplete,
  Box,
  Chip,
  Stack,
  TextField,
  Typography,
  createFilterOptions,
} from "@mui/material";

import type { FacetCount } from "../../utils/libraryFiltering";

export type AuthorOption = FacetCount & {
  githubUsername: string;
};

const filterOptions = createFilterOptions<AuthorOption>({
  // Keep the old behaviour where an author matched on either their name or their GitHub handle.
  stringify: (option) => `${option.value} ${option.githubUsername}`,
});

export type AuthorFacetProps = {
  options: AuthorOption[];
  selected: string[];
  onChange: (values: string[]) => void;
};

export const AuthorFacet = ({ options, selected, onChange }: AuthorFacetProps) => {
  const selectedOptions = selected.map(
    (value) =>
      options.find((option) => option.value === value) ?? { value, count: 0, githubUsername: "" },
  );

  return (
    <Box data-testid="facet-author" sx={{ pb: 1, mb: 1, borderBottom: 1, borderColor: "divider" }}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, py: 0.75 }}>
        <PersonIcon fontSize="small" sx={{ color: "text.secondary" }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>
          Author
        </Typography>
        {selected.length > 0 && (
          <Chip size="small" color="primary" label={selected.length} sx={{ height: 18 }} />
        )}
      </Stack>
      <Autocomplete
        multiple
        size="small"
        options={options}
        value={selectedOptions}
        filterOptions={filterOptions}
        getOptionLabel={(option) => option.value}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        onChange={(_event, next) => {
          onChange(next.map((option) => option.value));
        }}
        renderInput={(params) => (
          <TextField {...params} aria-label="Search authors" placeholder="Search authors" />
        )}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Box component="li" key={key} {...optionProps}>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {option.value}
                </Typography>
                {option.githubUsername && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    @{option.githubUsername}
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {option.count}
              </Typography>
            </Box>
          );
        }}
      />
    </Box>
  );
};
