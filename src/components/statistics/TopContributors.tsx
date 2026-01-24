import {StatisticsAggregator} from "./StatisticsAggregator";

export const TopContributors = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Active Contributors"
      nameColumnLabel="Author"
      propertyPath={["author", "githubUsername"]}
      filterQueryParam="author"
    />
  );
};
