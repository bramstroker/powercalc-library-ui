import type { SvgIconComponent } from "@mui/icons-material";
import { Box, Button, Slider, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import type { Range } from "../../../types/LibraryFilters";

import { FacetSection } from "./FacetSection";

const RangeInput = ({
  label,
  ariaLabel,
  value,
  min,
  max,
  onCommit,
}: {
  label: string;
  ariaLabel: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
}) => {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  return (
    <TextField
      label={label}
      type="number"
      size="small"
      fullWidth
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        const parsed = Number(text);
        const next =
          text.trim() && Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : value;
        setText(String(next));
        if (next !== value) onCommit(next);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          (event.target as HTMLInputElement).blur();
        }
      }}
      slotProps={{
        htmlInput: { min, max, step: "any", "aria-label": ariaLabel },
        inputLabel: { shrink: true },
      }}
    />
  );
};

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
  const commitRange = (next: Range) => {
    setDraft(next);
    onChange(next[0] <= bounds[0] && next[1] >= bounds[1] ? undefined : next);
  };

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
            commitRange(next as Range);
          }}
          getAriaLabel={(index) => `${index === 0 ? "Minimum" : "Maximum"} ${title.toLowerCase()}`}
          getAriaValueText={(value) => `${value}${suffix}`}
          sx={{ py: 1 }}
        />
      </Box>
      <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
        {([0, 1] as const).map((index) => (
          <RangeInput
            key={index}
            label={`${index === 0 ? "Minimum" : "Maximum"}${suffix ? ` (${unit})` : ""}`}
            ariaLabel={`${index === 0 ? "Minimum" : "Maximum"} ${title.toLowerCase()}${suffix ? ` (${unit})` : ""}`}
            value={draft[index]}
            min={index === 0 ? bounds[0] : draft[0]}
            max={index === 0 ? draft[1] : bounds[1]}
            onCommit={(number) =>
              commitRange(index === 0 ? [number, draft[1]] : [draft[0], number])
            }
          />
        ))}
      </Stack>

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
