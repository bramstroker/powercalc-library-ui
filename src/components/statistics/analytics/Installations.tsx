import React from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {useQuery} from "@tanstack/react-query";

import {fetchCountries, fetchVersions, VersionStats} from "../../../api/analytics.api";
import {Header} from "../../Header";
import AnalyticsHeader from "./AnalyticsHeader";
import {TopCountriesList} from "./TopCountriesList";
import VersionChart from "./VersionChart";
import Grid from "@mui/material/Grid";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

const Installations: React.FC = () => {
  const {data, isLoading, error} = useQuery({
    queryKey: ["versionsData"],
    queryFn: async () => {
      const [versionsData, countriesData] = await Promise.all([
        fetchVersions(),
        fetchCountries(),
      ]);

      return {versionsData, countriesData};
    },
  });

  if (isLoading) {
    return (
        <>
          <Header/>
          <Container maxWidth="lg" sx={{mt: 4}}>
            <Box sx={{display: "flex", justifyContent: "center", mt: 8}}>
              <CircularProgress/>
            </Box>
          </Container>
        </>
    );
  }

  if (error) {
    return (
        <>
          <Header/>
          <Container maxWidth="lg" sx={{mt: 4}}>
            <Typography color="error">
              Error loading versions data: {getErrorMessage(error)}
            </Typography>
          </Container>
        </>
    );
  }

  const versionsData = data?.versionsData as VersionStats;
  const haVersions = versionsData.ha_versions.slice(0, 10); // Limit to top 10 versions
  const pcVersions = versionsData.powercalc_versions.slice(0, 10); // Limit to top 10 versions

  return (
      <>
        <Header/>
        <Container maxWidth="lg" sx={{mt: 4, mb: 8}}>

          <AnalyticsHeader
              title={"Installation statistics"}
              description={" Overview of Home Assistant and PowerCalc versions used in installations."}
          />

          <Grid container spacing={4}>
            <Grid size={{xs: 12, md: 8}}>
              <VersionChart
                  title="Home Assistant Versions"
                  data={haVersions}
                  color="#7986cb"
                  marginBottom={4}
              />

              <VersionChart
                  title="PowerCalc Versions"
                  data={pcVersions}
                  color="#f50057"
                  marginBottom={4}
              />
            </Grid>

            <Grid size={{xs: 12, md: 4}}>
              <TopCountriesList data={data?.countriesData ?? []}/>
            </Grid>
          </Grid>
        </Container>
      </>
  );
};

export default Installations;
