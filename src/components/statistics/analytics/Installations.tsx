import { Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

import type {
  CountryStats,
  TimeseriesResponse,
  VersionStats} from "../../../api/analytics.api";
import {
  fetchCountries,
  fetchTimeseries,
  fetchVersions
} from "../../../api/analytics.api";
import { useSummary } from "../../../hooks/useSummary";

import { AnalyticsHeader } from "./AnalyticsHeader";
import { StatCard } from "./StatCard";
import { TopCountriesList } from "./TopCountriesList";
import { VersionChart } from "./VersionChart";

type InstallationsData = {
  versionsData: VersionStats;
  countriesData: CountryStats[];
  optinsData: TimeseriesResponse;
  sensorsData: TimeseriesResponse;
};

type SparkPoint = { label: string; value: number };

const startOfUTCDay = (d: Date) => {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const addUTCDays = (d: Date, days: number) => {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const formatUTCDateKey = (d: Date) => {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const buildSparklineData = (
    response: TimeseriesResponse,
    metric: string,
    fromUTC: Date,
    toUTC: Date,
    locale = "en-US"
): SparkPoint[] => {
  const points = response.series.find((s) => s.name === metric)?.points ?? [];

  const map = new Map<string, number>();
  for (const p of points) {
    map.set(p.ts.slice(0, 10), p.value);
  }

  const result: SparkPoint[] = [];
  for (let d = new Date(fromUTC); d <= toUTC; d = addUTCDays(d, 1)) {
    const key = formatUTCDateKey(d);
    const label = d.toLocaleDateString(locale, { month: "short", day: "numeric", timeZone: "UTC" });
    result.push({ label, value: map.get(key) ?? 0 });
  }

  return result;
};

export const Installations = () => {
  const { data: summaryData } = useSummary();

  const { fromUTC, toUTC } = React.useMemo(() => {
    const now = new Date();
    const to = startOfUTCDay(now);
    const from = addUTCDays(to, -29); // last 30 days including today
    return { fromUTC: from, toUTC: to };
  }, []);

  const { data } = useSuspenseQuery<InstallationsData>({
    queryKey: ["analytics", "installations", formatUTCDateKey(fromUTC), formatUTCDateKey(toUTC)],
    queryFn: async () => {
      const [versionsData, countriesData, optinsData, sensorsData] = await Promise.all([
        fetchVersions(),
        fetchCountries(),
        fetchTimeseries("optin_date", "day", "UTC", fromUTC, toUTC),
        fetchTimeseries("sensors", "day", "UTC", fromUTC, toUTC),
      ]);

      return { versionsData, countriesData, optinsData, sensorsData };
    },
  });

  const haVersions = React.useMemo(() => data.versionsData.ha_versions.slice(0, 10), [data.versionsData]);
  const pcVersions = React.useMemo(
      () => data.versionsData.powercalc_versions.slice(0, 10),
      [data.versionsData]
  );

  const optinsSeries = React.useMemo(
      () => buildSparklineData(data.optinsData, "optin_date", fromUTC, toUTC),
      [data.optinsData, fromUTC, toUTC]
  );

  const sensorsSeries = React.useMemo(
      () => buildSparklineData(data.sensorsData, "sensors", fromUTC, toUTC),
      [data.sensorsData, fromUTC, toUTC]
  );

  const avgSensorsPerInstallation = React.useMemo(() => {
    if (!summaryData.sampled_installations || summaryData.sampled_installations === 0) {
      return 0;
    }
    return summaryData.total_sensors! / summaryData.sampled_installations;
  }, [summaryData]);

  const optinsLastMonth = React.useMemo(() => {
    return optinsSeries.reduce((sum, point) => sum + point.value, 0);
  }, [optinsSeries]);

  return (
      <>
        <AnalyticsHeader
            title="Installation statistics"
            description="Overview of Home Assistant and PowerCalc versions used in installations."
        />

        <Grid container spacing={4} alignItems="stretch">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              <VersionChart title="Home Assistant Versions" data={haVersions} color="#7986cb" />
              <VersionChart title="PowerCalc Versions" data={pcVersions} color="#f50057" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={4}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <StatCard
                      title="Opt-ins"
                      value={
                        summaryData.sampled_installations != null
                            ? new Intl.NumberFormat("en", { notation: "compact" }).format(summaryData.sampled_installations)
                            : "0"
                      }
                      interval={`${optinsLastMonth} in last 30 days`}
                      trend="up"
                      hideTrendIcon
                      tooltip="Number of users who have opted in for analytics"
                      data={optinsSeries}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StatCard
                      title="Total sensors"
                      value={
                        summaryData.total_sensors != null
                            ? new Intl.NumberFormat("en", { notation: "compact", }).format(summaryData.total_sensors)
                            : "0"
                      }
                      interval={`avg ${avgSensorsPerInstallation.toFixed(0)} per installation`}
                      trend="up"
                      hideTrendIcon
                      tooltip="Total number of PowerCalc sensors created across all installations"
                      data={sensorsSeries}
                  />
                </Grid>
              </Grid>

              <TopCountriesList data={data.countriesData ?? []} limit={10} />
            </Stack>
          </Grid>
        </Grid>
      </>
  );
};
