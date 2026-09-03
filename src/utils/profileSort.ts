import type { PowerProfile } from "../types/PowerProfile";

export const PROFILE_SORT_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name" },
] as const;

export type ProfileSort = (typeof PROFILE_SORT_OPTIONS)[number]["value"];

export const DEFAULT_PROFILE_SORT: ProfileSort = "popular";

const profileSortValues = new Set<ProfileSort>(PROFILE_SORT_OPTIONS.map(({ value }) => value));

export const parseProfileSort = (value: string | null): ProfileSort =>
  value && profileSortValues.has(value as ProfileSort)
    ? (value as ProfileSort)
    : DEFAULT_PROFILE_SORT;

export const sortProfiles = (
  profiles: readonly PowerProfile[],
  sort: ProfileSort,
): PowerProfile[] =>
  [...profiles].sort((a, b) => {
    if (sort === "popular") {
      return (
        b.usageStats.installationCount - a.usageStats.installationCount ||
        a.name.localeCompare(b.name)
      );
    }
    if (sort === "newest") {
      return b.createdAt.getTime() - a.createdAt.getTime() || a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });
