import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { numberFormat } from "../../utils/formatters";

export const InlineHeroStat = ({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) => (
  <Stack
    direction="row"
    aria-label={`${numberFormat.format(value)} ${(value === 1 ? label.replace(/s$/, "") : label).toLowerCase()}`}
    sx={{ alignItems: "baseline", gap: 0.75, color: "text.secondary" }}
  >
    <Box sx={{ display: "flex", alignSelf: "center" }}>{icon}</Box>
    <Typography component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
      {numberFormat.format(value)}
    </Typography>
    <Typography component="span" variant="body2">
      {label}
    </Typography>
  </Stack>
);
