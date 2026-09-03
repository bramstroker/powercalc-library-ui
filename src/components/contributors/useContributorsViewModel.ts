import { useCallback, useMemo } from "react";

import { useLibrary } from "../../context/LibraryContext";
import { useUrlSearchParams } from "../../hooks/useUrlSearchParams";
import type { ContributorSummary, PowerProfile } from "../../types/PowerProfile";
import { CONTRIBUTOR_TIERS } from "../../utils/contributorTier";
import { daysSince } from "../../utils/recency";
import { slugifyPathSegment } from "../../utils/urlSlugs.mjs";

export const RECENT_ACTIVITY_DAYS = 90;
export const CONTRIBUTOR_PAGE_SIZE = 24;

export type ContributorSort = "recent" | "profiles" | "name";
export type RecentContributor = ContributorSummary & { recentProfileCount: number };

const SORT_KEYS: ContributorSort[] = ["recent", "profiles", "name"];
const DEFAULT_SORT: ContributorSort = "profiles";
const PARAM = { search: "q", sort: "sort", tier: "tier", active: "active", show: "show" } as const;

export const contributorDisplayName = ({ author }: ContributorSummary) =>
  author.name.trim() || author.githubUsername;

const validDateTime = (date: Date | null) => date?.getTime() ?? Number.NEGATIVE_INFINITY;

const withinRecentWindow = (profile: PowerProfile, now: Date) => {
  const age = daysSince(profile.createdAt, now);
  return age !== null && age >= 0 && age <= RECENT_ACTIVITY_DAYS;
};

export const useContributorsViewModel = (now: Date) => {
  const { contributorSummaries, powerProfiles, profilesByAuthorSlug } = useLibrary();
  const { searchParams, updateSearchParams } = useUrlSearchParams();

  const search = searchParams.get(PARAM.search) ?? "";
  const sortParam = searchParams.get(PARAM.sort) as ContributorSort | null;
  const sort = sortParam && SORT_KEYS.includes(sortParam) ? sortParam : DEFAULT_SORT;
  const tierParam = searchParams.get(PARAM.tier);
  const tierFilter = CONTRIBUTOR_TIERS.find((definition) => definition.tier === tierParam) ?? null;
  const activeOnly = searchParams.get(PARAM.active) === "1";
  const visibleCount = Math.max(
    CONTRIBUTOR_PAGE_SIZE,
    Number(searchParams.get(PARAM.show)) || CONTRIBUTOR_PAGE_SIZE,
  );

  /** Any change to what is being listed starts the directory over at the first page. */
  const updateFilters = useCallback(
    (changes: Record<string, string | null>) =>
      updateSearchParams({ ...changes, [PARAM.show]: null }),
    [updateSearchParams],
  );

  const recentProfiles = useMemo(
    () => powerProfiles.filter((profile) => withinRecentWindow(profile, now)),
    [now, powerProfiles],
  );

  const recentContributors = useMemo<RecentContributor[]>(() => {
    return contributorSummaries
      .map((summary) => {
        const profiles =
          profilesByAuthorSlug.get(slugifyPathSegment(summary.author.githubUsername)) ?? [];
        return {
          ...summary,
          recentProfileCount: profiles.filter((profile) => withinRecentWindow(profile, now)).length,
        };
      })
      .filter((summary) => summary.recentProfileCount > 0)
      .sort(
        (a, b) =>
          validDateTime(b.latestContributionAt) - validDateTime(a.latestContributionAt) ||
          contributorDisplayName(a).localeCompare(contributorDisplayName(b)),
      );
  }, [contributorSummaries, now, profilesByAuthorSlug]);

  const activeUsernames = useMemo(
    () => new Set(recentContributors.map((summary) => summary.author.githubUsername)),
    [recentContributors],
  );

  const sortedMatches = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("en-US");
    const matches = contributorSummaries.filter((summary) => {
      if (
        term &&
        !contributorDisplayName(summary).toLocaleLowerCase("en-US").includes(term) &&
        !summary.author.githubUsername.toLocaleLowerCase("en-US").includes(term)
      ) {
        return false;
      }
      if (tierFilter && summary.profileCount < tierFilter.min) {
        return false;
      }
      return !activeOnly || activeUsernames.has(summary.author.githubUsername);
    });

    return [...matches].sort((a, b) => {
      if (sort === "name") {
        return contributorDisplayName(a).localeCompare(contributorDisplayName(b));
      }
      if (sort === "profiles") {
        return (
          b.profileCount - a.profileCount ||
          contributorDisplayName(a).localeCompare(contributorDisplayName(b))
        );
      }
      return (
        validDateTime(b.latestContributionAt) - validDateTime(a.latestContributionAt) ||
        contributorDisplayName(a).localeCompare(contributorDisplayName(b))
      );
    });
  }, [activeOnly, activeUsernames, contributorSummaries, search, sort, tierFilter]);

  const contributedProfileCount = useMemo(
    () =>
      powerProfiles.filter((profile) =>
        profile.authors.some((author) => Boolean(author.githubUsername)),
      ).length,
    [powerProfiles],
  );

  return {
    activeOnly,
    contributedProfileCount,
    contributorSummaries,
    recentContributorCount: recentContributors.length,
    recentContributors,
    recentProfileCount: recentProfiles.length,
    search,
    sort,
    tier: tierFilter?.tier ?? null,
    totalMatches: sortedMatches.length,
    visibleContributors: sortedMatches.slice(0, visibleCount),
    visibleCount,
    clearActiveFilter: () => updateFilters({ [PARAM.active]: null }),
    loadMore: () =>
      updateSearchParams({ [PARAM.show]: String(visibleCount + CONTRIBUTOR_PAGE_SIZE) }),
    setSearch: (value: string) => updateFilters({ [PARAM.search]: value || null }),
    setSort: (value: ContributorSort) =>
      updateFilters({ [PARAM.sort]: value === DEFAULT_SORT ? null : value }),
    setTier: (value: string | null) => updateFilters({ [PARAM.tier]: value }),
    showActiveContributors: () => updateFilters({ [PARAM.active]: "1", [PARAM.sort]: "recent" }),
  };
};

export type ContributorsViewModel = ReturnType<typeof useContributorsViewModel>;
