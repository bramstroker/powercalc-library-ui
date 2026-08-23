import { StatisticsAggregator } from "./StatisticsAggregator";

export const TopDeviceTypes = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Common Device Types"
      breadcrumbLabel="Top device types"
      nameColumnLabel="Device Type"
      propertyPath="deviceType"
    />
  );
};
