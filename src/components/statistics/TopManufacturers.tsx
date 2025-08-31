import React from "react";
import StatisticsAggregator from "./StatisticsAggregator";

const TopManufacturers: React.FC = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Common Manufacturers"
      nameColumnLabel="Manufacturer"
      propertyPath={["manufacturer", "fullName"]}
    />
  );
};

export default TopManufacturers;
