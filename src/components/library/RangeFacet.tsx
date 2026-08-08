import type { SvgIconComponent } from "@mui/icons-material";
import { Box, Button, Slider, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import type { Range } from "../../types/LibraryFilters";

export type RangeFacetProps = {
  title: string;
  icon: SvgIconComponent;
  /** Appended to the value readout, e.g. "W". */
  unit?: string;
  bounds: Range;
  value: Range | undefined;
  onChange: (range: Range | undefined) => void;
  testId?: string;
};

/**
 * Commits to the URL on `onChangeCommitted` only, so dragging the slider does not spam history.
 * Widening back to the full bounds removes the filter entirely.
 */
export const RangeFacet = ({
  title,
  icon: Icon,
  unit,
  bounds,
  value,
  onChange,
  testId,
}: RangeFacetProps) => {
  const [draft, setDraft] = useState<Range>(value ?? bounds);

  useEffect(() => {
    setDraft(value ?? bounds);
  }, [value, bounds]);

  const step = bounds[1] - bounds[0] <= 10 ? 0.1 : 1;
  const suffix = unit ? ` ${unit}` : "";

  return (
    <Box
      data-testid={testId}
      sx={{ pb: 1, mb: 1, borderBottom: 1, borderColor: "divider" }}
    >
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, py: 0.75 }}>
        <Icon fontSize="small" sx={{ color: "text.secondary" }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {draft[0]} – {draft[1]}
          {suffix}
        </Typography>
      </Stack>

      {/* Inset so the thumbs at either end sit inside the panel rather than on its edges. */}
      <Box sx={{ px: 1.5 }}>
        <Slider
          size="small"
          value={draft}
          min={bounds[0]}
          max={bounds[1]}
          step={step}
          disableSwap
          onChange={(_event, next) => {
            setDraft(next as Range);
          }}
          onChangeCommitted={(_event, next) => {
            const [min, max] = next as Range;
            onChange(min <= bounds[0] && max >= bounds[1] ? undefined : [min, max]);
          }}
          getAriaLabel={() => title}
          sx={{ py: 1 }}
        />
      </Box>

      {value && (
        <Button
          size="small"
          color="inherit"
          onClick={() => {
            onChange(undefined);
          }}
        >
          Clear
        </Button>
      )}
    </Box>
  );
};
