import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

import type { PowerProfile } from "../../types/PowerProfile";
import { profilePath } from "../../utils/urlSlugs.mjs";

import { ProfileCard } from "./ProfileCard";
import { profileRowId } from "./profileRowId";

/**
 * A rendered card costs roughly 3 KB of markup — mostly repeated icon SVG and emotion class names —
 * so a brand with 200 profiles produced a 776 KB document and 12k DOM nodes to hydrate. Cards stop
 * after this many; the rest stay on the page as plain links, which cost about 80 bytes each. Every
 * profile therefore remains linked from its manufacturer and author page, at a twentieth of the
 * weight, without hiding anything behind a button a crawler will not press.
 */
const MAX_CARDS = 24;

export type ProfileCardGridProps = {
  profiles: PowerProfile[];
  headingComponent?: "h3" | "h4";
  "data-testid"?: string;
};

export const ProfileCardGrid = ({
  profiles,
  headingComponent,
  "data-testid": testId,
}: ProfileCardGridProps) => {
  const carded = profiles.slice(0, MAX_CARDS);
  const listed = profiles.slice(MAX_CARDS);

  return (
    <Box data-testid={testId}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {carded.map((profile) => (
          <ProfileCard
            key={profileRowId(profile)}
            profile={profile}
            headingComponent={headingComponent}
          />
        ))}
      </Box>

      {listed.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {listed.length} more {listed.length === 1 ? "profile" : "profiles"}
          </Typography>
          <Box
            component="ul"
            sx={{
              m: 0,
              p: 0,
              listStyle: "none",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              columnGap: 2,
              rowGap: 0.5,
            }}
          >
            {listed.map((profile) => (
              <Box component="li" key={profileRowId(profile)} sx={{ minWidth: 0 }}>
                <Link
                  component={RouterLink}
                  to={profilePath(profile.manufacturer.dirName, profile.modelId)}
                  prefetch="intent"
                  variant="body2"
                  underline="hover"
                  noWrap
                  sx={{ display: "block" }}
                >
                  {profile.modelId}
                  {profile.name && profile.name !== profile.modelId ? ` — ${profile.name}` : ""}
                </Link>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
