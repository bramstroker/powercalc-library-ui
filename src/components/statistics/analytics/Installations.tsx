import React from "react";
import {Stack} from "@mui/material";
import {useSuspenseQuery} from "@tanstack/react-query";

import {
  CountryStats,
  fetchCountries, fetchTimeseries,
  fetchVersions,
  TimeseriesResponse,
  VersionStats
} from "../../../api/analytics.api";
import {useSummary} from "../../../hooks/useSummary";
import AnalyticsHeader from "./AnalyticsHeader";
import {TopCountriesList} from "./TopCountriesList";
import VersionChart from "./VersionChart";
import Grid from "@mui/material/Grid";
import StatCard from "./StatCard";

type InstallationsData = {
  versionsData: VersionStats;
  countriesData: CountryStats[];
  optinsData: TimeseriesResponse;
};

const Installations: React.FC = () => {
  const { data: summaryData } = useSummary();
  const { data } = useSuspenseQuery<InstallationsData>({
    queryKey: ["analytics", "installations"],
    queryFn: async () => {
      // Calculate dates for the last 30 days
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 29); // 30 days including today

      const [versionsData, countriesData, optinsData] = await Promise.all([
        fetchVersions(),
        fetchCountries(),
        fetchTimeseries("optins", "day", "UTC", fromDate, toDate)
      ]);

      return {versionsData, countriesData, optinsData};
    },
  });

  const versionsData = data.versionsData as VersionStats;
  const haVersions = versionsData.ha_versions.slice(0, 10); // Limit to top 10 versions
  const pcVersions = versionsData.powercalc_versions.slice(0, 10); // Limit to top 10 versions

  // Process optins data to ensure 30 data points for the last 30 days
  const processOptinsData = () => {
    const optinsSeries = data.optinsData.series.find(s => s.name === "optins")?.points || [];

    // Create a map of dates to values
    const dateValueMap = new Map<string, number>();
    optinsSeries.forEach(point => {
      const date = point.ts.split('T')[0];
      dateValueMap.set(date, point.value);
    });

    // Generate array for the last 30 days with values or 0 for missing dates
    const result: Array<{ label: string; value: number }> = [];
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 29); // 30 days including today

    for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      const label = `${monthName} ${dayNum}`;
      result.push({
        label,
        value: dateValueMap.get(dateStr) || 0
      });
    }

    return result;
  };

  const optinsData = processOptinsData();

  return (
      <>
        <AnalyticsHeader
            title={"Installation statistics"}
            description={" Overview of Home Assistant and PowerCalc versions used in installations."}
        />

        <Grid container spacing={4}>
          <Grid size={{xs: 12, md: 8}}>
            <Stack sx={{gap: 4}}>
              <VersionChart
                  title="Home Assistant Versions"
                  data={haVersions}
                  color="#7986cb"
              />

              <VersionChart
                  title="PowerCalc Versions"
                  data={pcVersions}
                  color="#f50057"
              />
            </Stack>
          </Grid>

          <Grid size={{xs: 12, md: 4}}>
            <Stack sx={{gap: 4}}>
              <StatCard
                  title={'Opt-ins'}
                  value={summaryData?.sampled_installations?.toLocaleString() || '0'}
                  interval={''}
                  trend={'up'}
                  hideTrendIcon={true}
                  data={optinsData}
              />

              <TopCountriesList data={data.countriesData ?? []}/>
            </Stack>
          </Grid>
        </Grid>
      </>
  );
};

export default Installations;
