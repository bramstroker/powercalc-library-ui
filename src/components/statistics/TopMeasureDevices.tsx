import {StatisticsAggregator} from "./StatisticsAggregator";

export const TopMeasureDevices = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Used Measure Devices"
      breadcrumbLabel="Measurement devices"
      nameColumnLabel="Measure Device"
      propertyPath="measureDevice"
    />
  );
};
