import type { SvgIconComponent } from "@mui/icons-material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  Chip,
  Collapse,
  FormControlLabel,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useId, useMemo, useState } from "react";

import type { FacetCount } from "../../utils/libraryFiltering";

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
  defaultExpanded?: boolean;
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
  defaultExpanded = true,
  testId,
}: CheckboxFacetProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const contentId = useId();

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
    // The rule lives on the facet rather than between facets, so one that renders nothing does not
    // leave a stray line behind.
    <Box data-testid={testId} sx={{ pb: 1, mb: 1, borderBottom: 1, borderColor: "divider" }}>
      {/* A real button, so the section can be collapsed from the keyboard and is announced as a
          control rather than as plain text. */}
      <Stack
        component={ButtonBase}
        direction="row"
        aria-expanded={expanded}
        aria-controls={contentId}
        sx={{
          width: "100%",
          textAlign: "left",
          alignItems: "center",
          gap: 1,
          py: 0.75,
          borderRadius: 1,
          "&:hover": { color: "primary.main" },
        }}
        onClick={() => {
          setExpanded((current) => !current);
        }}
      >
        {Icon && <Icon fontSize="small" sx={{ color: "text.secondary" }} />}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>
          {title}
        </Typography>
        {selected.length > 0 && (
          <Chip size="small" color="primary" label={selected.length} sx={{ height: 18 }} />
        )}
        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </Stack>

      <Collapse id={contentId} in={expanded} unmountOnExit>
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
      </Collapse>
    </Box>
  );
};
