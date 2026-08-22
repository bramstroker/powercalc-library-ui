import {StatisticsAggregator} from "./StatisticsAggregator";

export const TopManufacturers = () => {
  return (
    <StatisticsAggregator
      title="Top 10 Most Common Manufacturers"
      breadcrumbLabel="Top manufacturers"
      nameColumnLabel="Manufacturer"
      propertyPath={["manufacturer", "fullName"]}
      filterQueryParam="manufacturer"
    />
  );
};
