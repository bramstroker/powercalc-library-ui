import {StatisticsAggregator} from "./StatisticsAggregator";

export const TopContributors = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Active Contributors"
      nameColumnLabel="Contributor"
      propertyPath="authors"
      valueExtractor={(profile) => profile.authors.map((author) => author.githubUsername).filter(Boolean)}
      filterQueryParam="author"
    />
  );
};
