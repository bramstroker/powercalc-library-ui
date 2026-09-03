import { Box, Stack, Typography } from "@mui/material";

import type { PowerProfile } from "../../../types/PowerProfile";
import { plural } from "../../../utils/plural";
import type { ProfileSort } from "../../../utils/profileSort";
import { ProfileCardGrid } from "../../library/cards/ProfileCardGrid";
import { ProfileSortControl } from "../../profile/ProfileSortControl";

export type AuthorProfilesProps = {
  contributionCount: number;
  manufacturerCount: number;
  onSortChange: (sort: ProfileSort) => void;
  profileSort: ProfileSort;
  profiles: PowerProfile[];
};

export const AuthorProfiles = ({
  contributionCount,
  manufacturerCount,
  onSortChange,
  profileSort,
  profiles,
}: AuthorProfilesProps) => (
  <Box component="section">
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{ alignItems: { sm: "center" }, gap: 1.5, mb: 2 }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
          Contributed profiles
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {plural(contributionCount, "profile")} across {plural(manufacturerCount, "manufacturer")}
        </Typography>
      </Box>
      {contributionCount > 1 && (
        <ProfileSortControl
          value={profileSort}
          label="Sort contributed profiles"
          onChange={onSortChange}
        />
      )}
    </Stack>

    <ProfileCardGrid data-testid="author-profile-list" profiles={profiles} />
  </Box>
);
