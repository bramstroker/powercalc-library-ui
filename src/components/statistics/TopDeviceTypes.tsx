import React from "react";

import StatisticsAggregator from "./StatisticsAggregator";

const TopDeviceTypes: React.FC = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Common Device Types"
      nameColumnLabel="Device Type"
      propertyPath="deviceType"
    />
  );
};

export default TopDeviceTypes;
