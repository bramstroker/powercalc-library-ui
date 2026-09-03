import type { SvgIconComponent } from "@mui/icons-material";
import { Box, Button, Slider, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import type { Range } from "../../../types/LibraryFilters";

import { FacetSection } from "./FacetSection";

export type RangeFacetProps = {
  title: string;
  icon: SvgIconComponent;
  /** Appended to the value readout, e.g. "W". */
  unit?: string;
  bounds: Range;
  value: Range | undefined;
  onChange: (range: Range | undefined) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
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
  expanded,
  onToggleExpanded,
  testId,
}: RangeFacetProps) => {
  const [draft, setDraft] = useState<Range>(value ?? bounds);

  useEffect(() => {
    setDraft(value ?? bounds);
  }, [value, bounds]);

  const step = bounds[1] - bounds[0] <= 10 ? 0.1 : 1;
  const suffix = unit ? ` ${unit}` : "";

  return (
    <FacetSection
      title={title}
      icon={Icon}
      expanded={expanded}
      onToggleExpanded={onToggleExpanded}
      testId={testId}
      summary={
        <Typography variant="caption" color="text.secondary">
          {draft[0]} – {draft[1]}
          {suffix}
        </Typography>
      }
    >
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
    </FacetSection>
  );
};
