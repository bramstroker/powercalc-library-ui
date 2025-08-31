import React from "react";
import StatisticsAggregator from "./StatisticsAggregator";

const TopAuthors: React.FC = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Active Authors"
      nameColumnLabel="Author"
      propertyPath="author"
    />
  );
};

export default TopAuthors;
