import React from "react";
import StatisticsAggregator from "./StatisticsAggregator";

const TopMeasureDevices: React.FC = () => {
  return (
    <StatisticsAggregator
      title="Top 20 Most Used Measure Devices"
      nameColumnLabel="Measure Device"
      numberOfTopItems={20}
      propertyPath="measureDevice"
    />
  );
};

export default TopMeasureDevices;
