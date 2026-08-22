import { queryOptions } from "@tanstack/react-query";

import {
  fetchDownloadLinks,
  fetchPlots,
  fetchProfileJson,
  fetchSubProfiles,
} from "../api/profileDetails.api";
import type { PowerProfile } from "../types/PowerProfile";

const profileKey = (profile: PowerProfile) => [
  profile.manufacturer.dirName,
  profile.modelId,
];

export const profileJsonQuery = (profile: PowerProfile) =>
  queryOptions({
    queryKey: ["profile-json", ...profileKey(profile)],
    queryFn: () => fetchProfileJson(profile),
  });

export const profileFilesQuery = (profile: PowerProfile) =>
  queryOptions({
    queryKey: ["profile-files", ...profileKey(profile)],
    queryFn: () => fetchDownloadLinks(profile),
  });

export const subProfilesQuery = (profile: PowerProfile) =>
  queryOptions({
    queryKey: ["profile-sub-profiles", ...profileKey(profile)],
    queryFn: () => fetchSubProfiles(profile),
  });

export const profilePlotsQuery = (profile: PowerProfile) =>
  queryOptions({
    queryKey: ["profile-plots", ...profileKey(profile)],
    queryFn: () => fetchPlots(profile),
  });
