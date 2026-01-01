import {StatisticsAggregator} from "./StatisticsAggregator";

export const TopMeasureDevices = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Used Measure Devices"
      nameColumnLabel="Measure Device"
      propertyPath="measureDevice"
    />
  );
};

