import { useMemo } from "react";

import { useUrlSearchParams } from "../../../hooks/useUrlSearchParams";
import type { Manufacturer, PowerProfile } from "../../../types/PowerProfile";
import { manufacturerLibraryIntroduction } from "../../../utils/manufacturerPresentation";
import {
  DEFAULT_PROFILE_SORT,
  parseProfileSort,
  type ProfileSort,
  sortProfiles,
} from "../../../utils/profileSort";

const PARAM = { search: "q", deviceType: "deviceType", sort: "sort" } as const;

/** Below this a brand's profiles fit on a screen or two, and a search box is only noise. */
const SEARCH_FROM = 12;

export type DeviceTypeCount = {
  deviceType: string;
  count: number;
};

type UseManufacturerViewModelOptions = {
  manufacturer?: Manufacturer;
  profiles: PowerProfile[];
};

export const useManufacturerViewModel = ({
  manufacturer,
  profiles,
}: UseManufacturerViewModelOptions) => {
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  const profileCount = profiles.length;
  const search = searchParams.get(PARAM.search) ?? "";
  const sort = parseProfileSort(searchParams.get(PARAM.sort));

  const deviceTypeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const profile of profiles) {
      counts.set(profile.deviceType, (counts.get(profile.deviceType) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([deviceType, count]) => ({ deviceType, count }))
      .sort((a, b) => b.count - a.count || a.deviceType.localeCompare(b.deviceType));
  }, [profiles]);

  // An unknown device type in the URL (stale link, hand-typed) simply shows everything.
  const deviceTypeParam = searchParams.get(PARAM.deviceType);
  const deviceType = deviceTypeCounts.some((entry) => entry.deviceType === deviceTypeParam)
    ? deviceTypeParam
    : null;

  const visibleProfiles = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = profiles.filter((profile) => {
      if (deviceType && profile.deviceType !== deviceType) return false;
      if (!term) return true;
      return (
        profile.modelId.toLowerCase().includes(term) ||
        profile.name.toLowerCase().includes(term) ||
        profile.aliases.some((alias) => alias.toLowerCase().includes(term))
      );
    });

    return sortProfiles(matched, sort);
  }, [profiles, deviceType, search, sort]);

  const knownProfileInstallations = useMemo(
    () => profiles.reduce((total, profile) => total + profile.usageStats.installationCount, 0),
    [profiles],
  );

  const setDeviceType = (next: string | null) => updateSearchParams({ [PARAM.deviceType]: next });
  const setSearch = (next: string) => updateSearchParams({ [PARAM.search]: next || null });
  const setSort = (next: ProfileSort) =>
    updateSearchParams({
      [PARAM.sort]: next === DEFAULT_PROFILE_SORT ? null : next,
    });

  return {
    deviceType,
    deviceTypeCounts,
    introduction: manufacturer ? manufacturerLibraryIntroduction(manufacturer, profiles) : "",
    isFiltered: deviceType !== null || search.trim() !== "",
    knownProfileInstallations,
    profileCount,
    search,
    setDeviceType,
    setSearch,
    setSort,
    showDeviceTypeFilter: deviceTypeCounts.length > 1,
    showProfileSearch: profileCount >= SEARCH_FROM,
    sort,
    visibleProfiles,
  };
};
