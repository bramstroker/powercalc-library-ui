import React from "react";
import {Stack} from "@mui/material";
import {useSuspenseQuery} from "@tanstack/react-query";

import {CountryStats, fetchCountries, fetchVersions, VersionStats} from "../../../api/analytics.api";
import AnalyticsHeader from "./AnalyticsHeader";
import {TopCountriesList} from "./TopCountriesList";
import VersionChart from "./VersionChart";
import Grid from "@mui/material/Grid";

type InstallationsData = {
  versionsData: VersionStats;
  countriesData: CountryStats[];
};

const Installations: React.FC = () => {
  const { data } = useSuspenseQuery<InstallationsData>({
    queryKey: ["installationsData"],
    queryFn: async () => {
      const [versionsData, countriesData] = await Promise.all([
        fetchVersions(),
        fetchCountries(),
      ]);

      return {versionsData, countriesData};
    },
  });

  const versionsData = data?.versionsData as VersionStats;
  const haVersions = versionsData.ha_versions.slice(0, 10); // Limit to top 10 versions
  const pcVersions = versionsData.powercalc_versions.slice(0, 10); // Limit to top 10 versions

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
            <TopCountriesList data={data?.countriesData ?? []}/>
          </Grid>
        </Grid>
      </>
  );
};

export default Installations;
