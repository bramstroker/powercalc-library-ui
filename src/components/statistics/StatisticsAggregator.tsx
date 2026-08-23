import { useMemo, useState } from "react";

import { useLibrary } from "../../context/LibraryContext";
import type { PowerProfile } from "../../types/PowerProfile";

import { StatisticsDisplay } from "./StatisticsDisplay";

type StatItem = {
  name: string;
  count: number;
};

type StatisticsAggregatorProps = {
  title: string;
  breadcrumbLabel: string;
  nameColumnLabel: string;
  propertyPath: string | string[];
  filterQueryParam?: string;
  valueExtractor?: (profile: PowerProfile) => string | string[] | undefined;
};

export const StatisticsAggregator = ({
  title,
  breadcrumbLabel,
  nameColumnLabel,
  propertyPath,
  filterQueryParam,
  valueExtractor,
}: StatisticsAggregatorProps) => {
  const [resultsCount, setResultsCount] = useState<number>(10);
  const { powerProfiles, total: totalProfiles } = useLibrary();

  // Derived during render rather than in an effect: effects do not run while prerendering, so
  // aggregating there shipped a static document containing nothing but the table header.
  const items = useMemo<StatItem[]>(() => {
    // Count items based on the property path
    const counts: Record<string, number> = {};

    powerProfiles.forEach((profile) => {
      let value: string | string[] | undefined;

      if (valueExtractor) {
        value = valueExtractor(profile);
      } else if (typeof propertyPath === "string") {
        value = profile[propertyPath as keyof PowerProfile] as string | undefined;
      } else if (Array.isArray(propertyPath)) {
        let current: unknown = profile;
        for (const path of propertyPath) {
          if (current && typeof current === "object" && path in current) {
            current = (current as Record<string, unknown>)[path];
          } else {
            current = undefined;
            break;
          }
        }
        value = current as string | undefined;
      }

      for (const entry of Array.isArray(value) ? value : [value]) {
        if (entry) {
          counts[entry] = (counts[entry] || 0) + 1;
        }
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    // `resultsCount` only slices the result, so it is deliberately not a dependency here — as an
    // effect dependency it re-ran the whole aggregation every time the reader changed "show top N".
  }, [powerProfiles, propertyPath, valueExtractor]);

  return (
    <StatisticsDisplay
      title={title.replace(/Top \d+/, `Top ${resultsCount}`)}
      breadcrumbLabel={breadcrumbLabel}
      items={items.slice(0, resultsCount)}
      totalItems={totalProfiles}
      nameColumnLabel={nameColumnLabel}
      filterQueryParam={filterQueryParam ?? (propertyPath as string)}
      resultsCount={resultsCount}
      aggregationsCount={items.length}
      onResultsCountChange={setResultsCount}
    />
  );
};
