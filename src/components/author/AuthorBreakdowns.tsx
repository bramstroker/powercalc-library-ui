import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import FactoryIcon from "@mui/icons-material/Factory";
import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";

import { plural } from "../../utils/plural";
import { humanizeIdentifier } from "../../utils/profilePresentation";
import { manufacturerPath } from "../../utils/urlSlugs.mjs";
import { getDeviceTypeIcon } from "../library/facetIcons";
import { ManufacturerLogo } from "../manufacturer/ManufacturerLogo";

import type { DeviceTypeCount, ManufacturerCount } from "./useAuthorViewModel";

const BreakdownRow = ({
  label,
  count,
  total,
  icon,
  accessibleLabel,
}: {
  label: ReactNode;
  count: number;
  total: number;
  icon?: ReactNode;
  accessibleLabel: string;
}) => (
  <Box>
    <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 0.75 }}>
      {icon && <Box sx={{ display: "flex", color: "text.secondary" }}>{icon}</Box>}
      <Typography variant="body2" sx={{ minWidth: 0, flex: 1, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {count}
      </Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={total === 0 ? 0 : (count / total) * 100}
      aria-label={accessibleLabel}
      aria-valuetext={`${count} of ${total} contributed profiles`}
      sx={{ height: 6, borderRadius: 999 }}
    />
  </Box>
);

export type AuthorBreakdownsProps = {
  contributionCount: number;
  deviceTypes: DeviceTypeCount[];
  githubUsername: string;
  manufacturers: ManufacturerCount[];
};

export const AuthorBreakdowns = ({
  contributionCount,
  deviceTypes,
  githubUsername,
  manufacturers,
}: AuthorBreakdownsProps) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
      gap: { xs: 2, sm: 3 },
    }}
  >
    <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 2 }}>
        <DevicesOtherIcon color="primary" />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
          Device mix
        </Typography>
      </Stack>
      <Stack sx={{ gap: 2 }}>
        {deviceTypes.map(({ key, count }) => {
          const DeviceIcon = getDeviceTypeIcon(key);
          return (
            <BreakdownRow
              key={key}
              label={humanizeIdentifier(key)}
              count={count}
              total={contributionCount}
              accessibleLabel={`${humanizeIdentifier(key)} contribution share`}
              icon={DeviceIcon ? <DeviceIcon fontSize="small" /> : undefined}
            />
          );
        })}
      </Stack>
    </Paper>

    <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 2 }}>
        <FactoryIcon color="primary" />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
          Top manufacturers
        </Typography>
      </Stack>
      <Stack sx={{ gap: 2 }}>
        {manufacturers.slice(0, 5).map(({ manufacturer, count }) => (
          <BreakdownRow
            key={manufacturer.dirName}
            label={
              <Typography
                component={RouterLink}
                to={manufacturerPath(manufacturer.dirName)}
                sx={{
                  color: "inherit",
                  fontSize: "inherit",
                  fontWeight: "inherit",
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                {manufacturer.fullName}
              </Typography>
            }
            count={count}
            total={contributionCount}
            accessibleLabel={`${manufacturer.fullName} contribution share`}
            icon={<ManufacturerLogo manufacturer={manufacturer} size={24} />}
          />
        ))}
      </Stack>
      {manufacturers.length > 5 && (
        <Typography
          component={RouterLink}
          to={`/?author=${encodeURIComponent(githubUsername)}`}
          variant="caption"
          sx={{
            display: "block",
            mt: 2,
            color: "text.secondary",
            textDecoration: "none",
            "&:hover": { color: "primary.main", textDecoration: "underline" },
          }}
        >
          And {plural(manufacturers.length - 5, "more manufacturer")} in the library
        </Typography>
      )}
    </Paper>
  </Box>
);
