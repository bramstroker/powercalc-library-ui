import { Box, Chip, Popover, Stack, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

export type ManufacturerAliasesProps = {
  aliases: string[];
};

export const ManufacturerAliases = ({ aliases }: ManufacturerAliasesProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  if (aliases.length === 0) return null;

  return (
    <>
      <Tooltip title="Alternate manufacturer names used for device discovery" arrow describeChild>
        <Chip
          label={`Discovery aliases (${aliases.length})`}
          size="small"
          variant="outlined"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? "manufacturer-aliases-popover" : undefined}
          sx={{ mt: 1, color: "text.secondary", borderColor: "divider" }}
        />
      </Tooltip>
      <Popover
        id="manufacturer-aliases-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ p: 2, width: { xs: 280, sm: 400 }, maxHeight: 320, overflowY: "auto" }}>
          <Typography variant="subtitle2">Discovery aliases</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Alternate manufacturer names used when matching devices to profiles.
          </Typography>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 1.5 }}>
            {aliases.map((alias) => (
              <Chip key={alias} label={alias} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};
