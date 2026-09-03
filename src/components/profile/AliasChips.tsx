import { Chip, Stack, Popover, Typography, Box, Tooltip } from "@mui/material";
import React, { useState } from "react";

interface ValueChipsProps {
  values: string[];
  singularLabel: string;
  pluralLabel: string;
  description: string;
  maxVisible?: number;
  marginTop?: number;
  /** Show every value across as many lines as needed. For pages with vertical room to spare. */
  wrap?: boolean;
}

export const ValueChips = ({
  values,
  singularLabel,
  pluralLabel,
  description,
  maxVisible = 1,
  marginTop = 0,
  wrap = false,
}: ValueChipsProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const valueArray = values ?? [];
  const itemLabel = valueArray.length === 1 ? singularLabel : pluralLabel;
  const popoverId = `${pluralLabel.replaceAll(" ", "-")}-popover`;

  if (valueArray.length === 0) {
    return null;
  }

  if (wrap) {
    return (
      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: marginTop }}>
        {valueArray.map((value) => (
          <Chip key={value} label={value} size="small" variant="outlined" color="primary" />
        ))}
      </Stack>
    );
  }

  // Show only first N chips, with a "+N more" chip if there are more
  const visibleValues = valueArray.slice(0, maxVisible);
  const remainingCount = valueArray.length - visibleValues.length;

  return (
    <>
      <Stack
        direction="row"
        sx={{
          gap: 1,
          minWidth: 0,
          width: "100%",
          overflow: "hidden",
          flexWrap: "nowrap",
          maxWidth: "100%",
          mt: marginTop,
        }}
      >
        {visibleValues.map((value) => (
          <Chip
            key={value}
            label={value}
            size="small"
            variant="outlined"
            color="primary"
            title={value}
            sx={{
              minWidth: 0,
              flexShrink: 1,
              "& .MuiChip-label": {
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        ))}
        {remainingCount > 0 && (
          <Tooltip title={`View all ${valueArray.length} ${itemLabel}`} arrow placement="top">
            <Chip
              label={`+${remainingCount} more`}
              size="small"
              variant="outlined"
              color="secondary"
              onClick={handleClick}
              aria-label={`View all ${valueArray.length} ${itemLabel}`}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={open ? popoverId : undefined}
              sx={{ cursor: "pointer", flexShrink: 0 }}
            />
          </Tooltip>
        )}
      </Stack>
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, width: { xs: 280, sm: 400 }, maxWidth: "calc(100vw - 32px)" }}>
          <Typography variant="subtitle1">
            {pluralLabel.charAt(0).toUpperCase() + pluralLabel.slice(1)} ({valueArray.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 1.5 }}>
            {valueArray.map((value) => (
              <Chip key={value} label={value} size="small" variant="outlined" color="primary" />
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

type AliasChipsProps = Omit<
  ValueChipsProps,
  "values" | "singularLabel" | "pluralLabel" | "description"
> & {
  aliases: string[];
};

export const AliasChips = ({ aliases, ...props }: AliasChipsProps) => (
  <ValueChips
    values={aliases}
    singularLabel="alias"
    pluralLabel="aliases"
    description="Alternate model IDs used to match this device."
    {...props}
  />
);
