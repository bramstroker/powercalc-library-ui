import type { ProfileStats } from "../api/analytics.api";
import { fetchProfiles } from "../api/analytics.api";
import { fetchLibrary } from "../api/library.api";
import type {
  Author,
  ContributorSummary,
  Manufacturer,
  PowerProfile,
  UsageStats,
} from "../types/PowerProfile";
import { mapToBasePowerProfile } from "../utils/profileMappers";
import { slugifyPathSegment } from "../utils/urlSlugs.mjs";

export interface LibraryData {
  powerProfiles: PowerProfile[];
  powerProfilesBySlugKey: Map<string, PowerProfile>;
  total: number;
  authors: Record<string, Author>;
  authorsBySlug: Record<string, Author>;
  manufacturers: Record<string, Manufacturer>;
  manufacturersBySlug: Record<string, Manufacturer>;
  /**
   * Per-entity indexes built during the single pass that already visits every model. The entity
   * pages are prerendered one process-wide render at a time, so filtering the full profile list per
   * page would turn one linear pass into one per generated page.
   */
  profilesByManufacturerSlug: Map<string, PowerProfile[]>;
  profilesByAuthorSlug: Map<string, PowerProfile[]>;
  contributionCountsByAuthor: Map<string, number>;
  contributorSummaries: ContributorSummary[];
}

const createAnalyticsMap = (analyticsData: ProfileStats[]): Map<string, ProfileStats> => {
  const map = new Map<string, ProfileStats>();
  for (const stat of analyticsData) {
    map.set(`${stat.manufacturer}/${stat.model}`, stat);
  }
  return map;
};

const getUsageStats = (stat?: ProfileStats): UsageStats => ({
  installationCount: stat?.installation_count ?? 0,
  deviceCount: stat?.count ?? 0,
  percentage: stat?.percentage ?? 0,
});

const emptyLibrary = (): LibraryData => ({
  powerProfiles: [],
  powerProfilesBySlugKey: new Map(),
  total: 0,
  authors: {},
  authorsBySlug: {},
  manufacturers: {},
  manufacturersBySlug: {},
  profilesByManufacturerSlug: new Map(),
  profilesByAuthorSlug: new Map(),
  contributionCountsByAuthor: new Map(),
  contributorSummaries: [],
});

/** The rank of `author` among all contributors, counting ties as the same rank. */
export const authorRank = (library: LibraryData, githubUsername: string) => {
  const counts = library.contributionCountsByAuthor;
  const ownCount = counts.get(githubUsername);
  if (ownCount == null) return null;

  let ahead = 0;
  for (const count of counts.values()) {
    if (count > ownCount) ahead += 1;
  }
  return { rank: ahead + 1, total: counts.size };
};

export const libraryQuery = () => ({
  queryKey: ["library"] as const,
  staleTime: Infinity,
  gcTime: Infinity,
  queryFn: async (): Promise<LibraryData> => {
    const [library, analyticsData] = await Promise.all([fetchLibrary(), fetchProfiles()]);

    if (!library.manufacturers?.length) {
      return emptyLibrary();
    }

    const analyticsMap = createAnalyticsMap(analyticsData ?? []);
    const powerProfiles: PowerProfile[] = [];
    const powerProfilesBySlugKey = new Map<string, PowerProfile>();
    const authors: Record<string, Author> = {};
    const authorsBySlug: Record<string, Author> = {};
    const manufacturers: Record<string, Manufacturer> = {};
    const manufacturersBySlug: Record<string, Manufacturer> = {};
    const profilesByManufacturerSlug = new Map<string, PowerProfile[]>();
    const profilesByAuthorSlug = new Map<string, PowerProfile[]>();
    const contributionCountsByAuthor = new Map<string, number>();

    for (const manufacturerData of library.manufacturers) {
      const manufacturerKey = manufacturerData.dir_name;
      const manufacturerSlug = slugifyPathSegment(manufacturerKey);
      const manufacturer: Manufacturer = {
        fullName: manufacturerData.full_name,
        dirName: manufacturerData.dir_name,
        aliases: manufacturerData.aliases ?? [],
      };
      manufacturers[manufacturerKey] = manufacturer;
      manufacturersBySlug[manufacturerSlug] = manufacturer;

      const manufacturerProfiles: PowerProfile[] = [];
      profilesByManufacturerSlug.set(manufacturerSlug, manufacturerProfiles);

      for (const modelData of manufacturerData.models ?? []) {
        const key = `${manufacturerKey}/${modelData.id}`;
        const stat = analyticsMap.get(key);
        const usageStats = getUsageStats(stat);

        const profile = mapToBasePowerProfile(modelData, manufacturer, usageStats);
        powerProfiles.push(profile);
        manufacturerProfiles.push(profile);
        powerProfilesBySlugKey.set(
          `${manufacturerSlug}/${slugifyPathSegment(modelData.id)}`,
          profile,
        );
        for (const legacyId of profile.legacyIds ?? []) {
          powerProfilesBySlugKey.set(
            `${manufacturerSlug}/${slugifyPathSegment(legacyId)}`,
            profile,
          );
        }

        for (const author of profile.authors) {
          if (!author.githubUsername) continue;

          const authorSlug = slugifyPathSegment(author.githubUsername);
          authors[author.githubUsername] ??= author;
          authorsBySlug[authorSlug] ??= author;

          const authorProfiles = profilesByAuthorSlug.get(authorSlug);
          if (authorProfiles) {
            authorProfiles.push(profile);
          } else {
            profilesByAuthorSlug.set(authorSlug, [profile]);
          }

          contributionCountsByAuthor.set(
            author.githubUsername,
            (contributionCountsByAuthor.get(author.githubUsername) ?? 0) + 1,
          );
        }
      }
    }

    const contributorSummaries = Object.values(authors).map((author): ContributorSummary => {
      const authorSlug = slugifyPathSegment(author.githubUsername);
      const profiles = profilesByAuthorSlug.get(authorSlug) ?? [];
      const datedProfiles = profiles.filter(
        (profile) => !Number.isNaN(profile.createdAt.getTime()),
      );
      const latestProfile = datedProfiles.reduce<PowerProfile | null>(
        (latest, profile) =>
          !latest || profile.createdAt.getTime() > latest.createdAt.getTime() ? profile : latest,
        null,
      );
      const firstContributionAt = datedProfiles.reduce<Date | null>(
        (first, profile) =>
          !first || profile.createdAt.getTime() < first.getTime() ? profile.createdAt : first,
        null,
      );

      return {
        author,
        profileCount: profiles.length,
        manufacturerCount: new Set(profiles.map((profile) => profile.manufacturer.dirName)).size,
        deviceTypes: [...new Set(profiles.map((profile) => profile.deviceType))].sort((a, b) =>
          a.localeCompare(b),
        ),
        firstContributionAt,
        latestContributionAt: latestProfile?.createdAt ?? null,
        latestProfile,
      };
    });

    return {
      powerProfiles,
      powerProfilesBySlugKey,
      total: powerProfiles.length,
      authors,
      authorsBySlug,
      manufacturers,
      manufacturersBySlug,
      profilesByManufacturerSlug,
      profilesByAuthorSlug,
      contributionCountsByAuthor,
      contributorSummaries,
    };
  },
});
