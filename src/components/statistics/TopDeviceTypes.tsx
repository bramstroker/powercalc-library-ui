import {StatisticsAggregator} from "./StatisticsAggregator";

export const TopDeviceTypes = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Common Device Types"
      nameColumnLabel="Device Type"
      propertyPath="deviceType"
    />
  );
};

