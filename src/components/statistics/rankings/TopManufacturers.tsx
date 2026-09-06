import { StatisticsAggregator } from "./StatisticsAggregator";

export const TopManufacturers = () => {
  return (
    <StatisticsAggregator
      title="Top manufacturers"
      breadcrumbLabel="Top manufacturers"
      nameColumnLabel="Manufacturer"
      propertyPath={["manufacturer", "fullName"]}
      filterQueryParam="manufacturer"
    />
  );
};
