import {StatisticsAggregator} from "./StatisticsAggregator";

export const TopAuthors = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Active Authors"
      nameColumnLabel="Author"
      propertyPath="author"
    />
  );
};

