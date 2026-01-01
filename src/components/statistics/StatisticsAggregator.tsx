import { useState, useEffect } from "react";

import { useLibrary } from "../../context/LibraryContext";
import type { PowerProfile } from "../../types/PowerProfile";

import { StatisticsDisplay } from "./StatisticsDisplay";

type StatItem = {
  name: string;
  count: number;
};

type StatisticsAggregatorProps = {
  title: string;
  nameColumnLabel: string;
  propertyPath: string | string[];
  filterQueryParam?: string;
  valueExtractor?: (profile: PowerProfile) => string | undefined;
};

export const StatisticsAggregator = ({
  title,
  nameColumnLabel,
  propertyPath,
  filterQueryParam,
  valueExtractor
}: StatisticsAggregatorProps) => {
  const [items, setItems] = useState<StatItem[]>([]);
  const [resultsCount, setResultsCount] = useState<number>(10);
  const { powerProfiles, total: totalProfiles } = useLibrary();

  useEffect(() => {
    if (powerProfiles.length > 0) {
      // Count items based on the property path
      const counts: Record<string, number> = {};

      powerProfiles.forEach(profile => {
        let value: string | undefined;

        if (valueExtractor) {
          value = valueExtractor(profile);
        } else if (typeof propertyPath === 'string') {
          value = profile[propertyPath as keyof PowerProfile] as string | undefined;
        } else if (Array.isArray(propertyPath)) {
          let current: unknown = profile;
          for (const path of propertyPath) {
            if (current && typeof current === 'object' && path in current) {
              current = (current as Record<string, unknown>)[path];
            } else {
              current = undefined;
              break;
            }
          }
          value = current as string | undefined;
        }

        if (value) {
          counts[value] = (counts[value] || 0) + 1;
        }
      });

      const sortedItems = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setItems(sortedItems);
    }
  }, [powerProfiles, propertyPath, valueExtractor, resultsCount]);

  return (
    <StatisticsDisplay
      title={title.replace(/Top \d+/, `Top ${resultsCount}`)}
      items={items.slice(0, resultsCount)}
      totalItems={totalProfiles}
      nameColumnLabel={nameColumnLabel}
      filterQueryParam={filterQueryParam ?? propertyPath as string}
      resultsCount={resultsCount}
      aggregationsCount={items.length}
      onResultsCountChange={setResultsCount}
    />
  );
};
