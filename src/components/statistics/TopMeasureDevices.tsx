import React from "react";
import StatisticsAggregator from "./StatisticsAggregator";

const TopMeasureDevices: React.FC = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Used Measure Devices"
      nameColumnLabel="Measure Device"
      propertyPath="measureDevice"
    />
  );
};

export default TopMeasureDevices;
