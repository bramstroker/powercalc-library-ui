import { Box, Chip, Stack, Typography } from "@mui/material";

import {
  categoryProfileCountDescription,
  type ProfileCategoryConfig,
} from "../config/profileCategories";
import type { BreadcrumbItem } from "../seo/breadcrumbs";
import type { PowerProfile } from "../types/PowerProfile";
import { numberFormat } from "../utils/formatters";

import { ProfileCardGrid } from "./library/ProfileCardGrid";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

export const ProfileCategory = ({
  config,
  value,
  profiles,
}: {
  config: ProfileCategoryConfig;
  value: string;
  profiles: PowerProfile[];
}) => {
  const label = config.label(value);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", to: "/" },
    { label: config.breadcrumbLabel, to: config.indexPath },
    { label },
  ];

  return (
    <>
      <PageBreadcrumbs items={breadcrumbs} includeStructuredData={false} />

      <Box component="header" sx={{ mb: 4 }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
          Powercalc profile library
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", sm: "3rem" } }}
          gutterBottom
        >
          {label} power profiles
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: "90ch" }}>
          {config.introduction(value)}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: "90ch" }}>
          {categoryProfileCountDescription(profiles.length)}
        </Typography>
        <Chip
          label={`${numberFormat.format(profiles.length)} ${profiles.length === 1 ? "profile" : "profiles"}`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 2 }}
        />
      </Box>

      <Box component="section" aria-labelledby="category-profiles-heading">
        <Stack direction="row" sx={{ alignItems: "baseline", gap: 1, mb: 2 }}>
          <Typography
            id="category-profiles-heading"
            variant="h5"
            component="h2"
            sx={{ fontWeight: 800 }}
          >
            Profiles
          </Typography>
        </Stack>
        <ProfileCardGrid profiles={profiles} data-testid="category-profile-list" />
      </Box>
    </>
  );
};
