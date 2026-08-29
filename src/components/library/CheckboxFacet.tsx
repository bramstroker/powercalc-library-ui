import type { SvgIconComponent } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type { FacetCount } from "../../utils/libraryFiltering";

import { FacetSection } from "./FacetSection";

const COLLAPSED_COUNT = 6;

export type CheckboxFacetProps = {
  title: string;
  icon?: SvgIconComponent;
  options: FacetCount[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  /** Optional glyph in front of each option's label, e.g. the device type's own icon. */
  renderOptionIcon?: (value: string) => ReactNode;
  /** Adds a type-to-filter box, for facets with many options. */
  searchable?: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  testId?: string;
};

export const CheckboxFacet = ({
  title,
  icon: Icon,
  options,
  selected,
  onToggle,
  onClear,
  renderOptionIcon,
  searchable = false,
  expanded,
  onToggleExpanded,
  testId,
}: CheckboxFacetProps) => {
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");

  const visibleOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = needle
      ? options.filter((option) => option.value.toLowerCase().includes(needle))
      : options;
    // Selected values stay visible even when they fall outside the collapsed window.
    const selectedMissing = selected
      .filter((value) => !matching.some((option) => option.value === value))
      .map((value) => ({ value, count: 0 }));
    return [...selectedMissing, ...matching];
  }, [options, query, selected]);

  const truncated = !showAll && !query && visibleOptions.length > COLLAPSED_COUNT;
  const shown = truncated ? visibleOptions.slice(0, COLLAPSED_COUNT) : visibleOptions;

  if (options.length === 0 && selected.length === 0) {
    return null;
  }

  return (
    <FacetSection
      title={title}
      icon={Icon}
      expanded={expanded}
      onToggleExpanded={onToggleExpanded}
      testId={testId}
      summary={
        selected.length > 0 ? (
          <Chip size="small" color="primary" label={selected.length} sx={{ height: 18 }} />
        ) : undefined
      }
    >
      {searchable && (
        <TextField
          size="small"
          fullWidth
          aria-label={`Search ${title.toLowerCase()}`}
          placeholder={`Search ${title.toLowerCase()}`}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          sx={{ mb: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      <Box sx={{ maxHeight: showAll || query ? 260 : undefined, overflowY: "auto" }}>
        {shown.map((option) => (
          <FormControlLabel
            key={option.value}
            sx={{ display: "flex", width: "100%", mr: 0 }}
            control={
              <Checkbox
                size="small"
                checked={selected.includes(option.value)}
                onChange={() => {
                  onToggle(option.value);
                }}
              />
            }
            label={
              <Stack direction="row" sx={{ width: "100%", alignItems: "center", gap: 1 }}>
                {renderOptionIcon?.(option.value)}
                <Typography variant="body2" noWrap title={option.value} sx={{ flexGrow: 1 }}>
                  {option.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.count}
                </Typography>
              </Stack>
            }
            slotProps={{ typography: { sx: { width: "100%", minWidth: 0 } } }}
          />
        ))}
        {shown.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            No matches
          </Typography>
        )}
      </Box>

      <Stack direction="row" sx={{ gap: 1 }}>
        {(truncated || showAll) && !query && (
          <Button
            size="small"
            onClick={() => {
              setShowAll((current) => !current);
            }}
          >
            {showAll ? "Show less" : `Show ${visibleOptions.length - COLLAPSED_COUNT} more`}
          </Button>
        )}
        {selected.length > 0 && (
          <Button size="small" color="inherit" onClick={onClear}>
            Clear
          </Button>
        )}
      </Stack>
    </FacetSection>
  );
};
