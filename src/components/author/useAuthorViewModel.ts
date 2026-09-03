import { useMemo } from "react";

import { useUrlSearchParams } from "../../hooks/useUrlSearchParams";
import { CalculationStrategy } from "../../types/CalculationStrategy";
import type { Author, Manufacturer, PowerProfile } from "../../types/PowerProfile";
import { getContributorTier } from "../../utils/contributorTier";
import { humanizeIdentifier } from "../../utils/profilePresentation";
import {
  DEFAULT_PROFILE_SORT,
  parseProfileSort,
  type ProfileSort,
  sortProfiles,
} from "../../utils/profileSort";

export type DeviceTypeCount = {
  key: string;
  count: number;
};

export type ManufacturerCount = DeviceTypeCount & {
  manufacturer: Manufacturer;
};

const countBy = <T>(items: readonly T[], keyOf: (item: T) => string): DeviceTypeCount[] => {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
};

type UseAuthorViewModelOptions = {
  authorDetails?: Author;
  authorProfiles: PowerProfile[];
};

export const useAuthorViewModel = ({
  authorDetails,
  authorProfiles,
}: UseAuthorViewModelOptions) => {
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  const profileSort = parseProfileSort(searchParams.get("sort"));
  const githubUsername = authorDetails?.githubUsername;
  const contributionCount = authorProfiles.length;

  const deviceTypes = useMemo(
    () => countBy(authorProfiles, (profile) => profile.deviceType),
    [authorProfiles],
  );

  const manufacturers = useMemo(() => {
    const byName = new Map<string, Manufacturer>();
    for (const profile of authorProfiles) {
      byName.set(profile.manufacturer.dirName, profile.manufacturer);
    }
    return countBy(authorProfiles, (profile) => profile.manufacturer.dirName).map((entry) => ({
      ...entry,
      manufacturer: byName.get(entry.key)!,
    }));
  }, [authorProfiles]);

  const contributorSince = useMemo(() => {
    if (authorProfiles.length === 0) return null;
    return Math.min(...authorProfiles.map((profile) => profile.createdAt.getFullYear()));
  }, [authorProfiles]);

  const achievements = useMemo(() => {
    const labels: string[] = [];
    const primaryType = deviceTypes[0];
    if (primaryType && contributionCount >= 5 && primaryType.count / contributionCount >= 0.5) {
      labels.push(`${humanizeIdentifier(primaryType.key)} specialist`);
    }
    if (
      authorProfiles.filter((profile) => profile.calculationStrategy === CalculationStrategy.LUT)
        .length >= 5
    ) {
      labels.push("LUT contributor");
    }
    return labels.slice(0, 2);
  }, [authorProfiles, contributionCount, deviceTypes]);

  const sortedProfiles = useMemo(
    () => sortProfiles(authorProfiles, profileSort),
    [authorProfiles, profileSort],
  );

  const impact = useMemo(
    () =>
      authorProfiles.reduce(
        (totals, profile) => ({
          knownDevices: totals.knownDevices + profile.usageStats.deviceCount,
          knownProfileInstallations:
            totals.knownProfileInstallations + profile.usageStats.installationCount,
        }),
        { knownDevices: 0, knownProfileInstallations: 0 },
      ),
    [authorProfiles],
  );

  const setProfileSort = (next: ProfileSort) =>
    updateSearchParams({
      sort: next === DEFAULT_PROFILE_SORT ? null : next,
    });

  return {
    achievements,
    contributionCount,
    contributorSince,
    deviceTypes,
    displayName: authorDetails?.name || githubUsername || "Contributor",
    githubUsername,
    hasContributorTier: Boolean(getContributorTier(contributionCount)),
    ...impact,
    manufacturers,
    profileSort,
    setProfileSort,
    showBreakdowns: contributionCount >= 3,
    sortedProfiles,
  };
};
