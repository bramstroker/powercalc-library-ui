import { Box, Divider, List, ListItemButton, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { Link as RouterLink } from "react-router";

import { useLibrary } from "../../context/LibraryContext";
import type { PowerProfile } from "../../types/PowerProfile";
import { formatDateUtc } from "../../utils/dateFormat";
import { NEW_PROFILE_DAYS, isRecentlyAdded, recentlyAdded } from "../../utils/recency";
import { profilePath } from "../../utils/urlSlugs.mjs";
import { AliasChips } from "../AliasChips";
import { DeviceTypeIcon } from "../library/facetIcons";
import { NewBadge } from "../library/NewBadge";
import { PageBreadcrumbs } from "../PageBreadcrumbs";

/** Also drives the route module's description, so the page and its meta tag cannot disagree. */
export const NEW_PROFILE_WINDOW_DAYS = 90;

const formatDate = (date: Date) => formatDateUtc(date);

const groupByDay = (profiles: PowerProfile[]) => {
  const groups = new Map<string, PowerProfile[]>();
  for (const profile of profiles) {
    const key = formatDate(profile.createdAt);
    groups.set(key, [...(groups.get(key) ?? []), profile]);
  }
  return [...groups.entries()];
};

/**
 * Driven by `createdAt`. `updatedAt` looks tempting but is meaningless here: nearly every profile
 * in the library carries a recent update timestamp from bulk re-imports.
 */
export const WhatsNew = () => {
  const { powerProfiles } = useLibrary();

  const recent = useMemo(
    () => recentlyAdded(powerProfiles, NEW_PROFILE_WINDOW_DAYS),
    [powerProfiles],
  );
  const groups = useMemo(() => groupByDay(recent), [recent]);

  return (
    <Box>
      <PageBreadcrumbs items={[{ label: "Home", to: "/" }, { label: "What's new" }]} />
      <Typography variant="h4" component="h1" gutterBottom>
        What&apos;s new
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {recent.length} power {recent.length === 1 ? "profile" : "profiles"} added in the last{" "}
        {NEW_PROFILE_WINDOW_DAYS} days. Anything from the last {NEW_PROFILE_DAYS} days is flagged as new across
        the library.
      </Typography>

      {recent.length === 0 && (
        <Typography color="text.secondary">
          No profiles have been added in this window.
        </Typography>
      )}

      {groups.map(([day, profiles]) => (
        <Box key={day} sx={{ mb: 3 }} data-testid="whats-new-day">
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {day}
          </Typography>
          <List disablePadding>
            {profiles.map((profile) => (
              <Box key={`${profile.manufacturer.dirName}/${profile.modelId}`}>
                <ListItemButton
                  component={RouterLink}
                  to={profilePath(profile.manufacturer.dirName, profile.modelId)}
                  sx={{ alignItems: "flex-start", gap: 1.5, py: 1.5 }}
                >
                  <Box sx={{ width: 24, flexShrink: 0, mt: 0.25 }}>
                    <DeviceTypeIcon deviceType={profile.deviceType} />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" sx={{ alignItems: "center", gap: 0.75, minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {profile.manufacturer.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ·
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                        {profile.modelId}
                      </Typography>
                      {isRecentlyAdded(profile) && <NewBadge />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {profile.name}
                    </Typography>
                    {profile.aliases.length > 0 && (
                      <Box sx={{ mt: 0.75 }}>
                        <AliasChips aliases={profile.aliases} maxVisible={2} />
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      by {profile.authors.map((author) => author.name).filter(Boolean).join(", ")}
                    </Typography>
                  </Box>
                </ListItemButton>
                <Divider component="li" />
              </Box>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
};
