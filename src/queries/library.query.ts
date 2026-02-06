import type { ProfileStats } from "../api/analytics.api";
import { fetchProfiles } from "../api/analytics.api";
import { fetchLibrary } from "../api/library.api";
import type { Author, Manufacturer, PowerProfile, UsageStats } from "../types/PowerProfile";
import { mapToBasePowerProfile } from "../utils/profileMappers";

export interface LibraryData {
  powerProfiles: PowerProfile[];
  powerProfilesByKey: Map<string, PowerProfile>;
  total: number;
  authors: Record<string, Author>;
  manufacturers: Record<string, Manufacturer>;
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

export const libraryQuery = () => ({
  queryKey: ["library"] as const,
  staleTime: Infinity,
  gcTime: Infinity,
  queryFn: async (): Promise<LibraryData> => {
    const [library, analyticsData] = await Promise.all([
      fetchLibrary(),
      fetchProfiles(),
    ]);

    if (!library.manufacturers?.length) {
      return {
        powerProfiles: [],
        powerProfilesByKey: new Map(),
        total: 0,
        authors: {},
        manufacturers: {},
      };
    }

    const analyticsMap = createAnalyticsMap(analyticsData ?? []);
    const powerProfiles: PowerProfile[] = [];
    const powerProfilesByKey = new Map<string, PowerProfile>();
    const authors: Record<string, Author> = {};
    const manufacturers: Record<string, Manufacturer> = {};

    for (const manufacturerData of library.manufacturers) {
      const manufacturerKey = manufacturerData.dir_name;
      const manufacturer: Manufacturer = {
        fullName: manufacturerData.full_name,
        dirName: manufacturerData.dir_name,
      };
      manufacturers[manufacturerKey] = manufacturer;

      for (const modelData of manufacturerData.models ?? []) {
        const key = `${manufacturerKey}/${modelData.id}`;
        const stat = analyticsMap.get(key);
        const usageStats = getUsageStats(stat);

        const profile = mapToBasePowerProfile(modelData, manufacturer, usageStats);
        powerProfiles.push(profile);
        powerProfilesByKey.set(key, profile);

        if (profile.author.githubUsername) {
          authors[profile.author.githubUsername] ??= profile.author;
        }
      }
    }

    return {
      powerProfiles,
      powerProfilesByKey,
      total: powerProfiles.length,
      authors,
      manufacturers,
    };
  },
});