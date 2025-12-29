import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useQuery } from "@tanstack/react-query";

import { fetchVersionsData, VersionsData } from "../../../api/analytics.api";
import { Header } from "../../Header";
import AnalyticsHeader from "./AnalyticsHeader";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

const Installations: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["versionsData"],
    queryFn: fetchVersionsData,
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography color="error">
            Error loading versions data: {getErrorMessage(error)}
          </Typography>
        </Container>
      </>
    );
  }

  const versionsData = data as VersionsData;

  // Prepare data for HA versions chart
  const haVersions = versionsData.ha_versions.slice(0, 10); // Limit to top 10 versions
  const haVersionLabels = haVersions.map(v => v.version);
  const haVersionCounts = haVersions.map(v => v.installation_count);

  // Prepare data for powercalc versions chart
  const pcVersions = versionsData.powercalc_versions.slice(0, 10); // Limit to top 10 versions
  const pcVersionLabels = pcVersions.map(v => v.version);
  const pcVersionCounts = pcVersions.map(v => v.installation_count);

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <AnalyticsHeader
            title={"Installation statistics"}
            description={" Overview of Home Assistant and PowerCalc versions used in installations."}
        />

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Home Assistant Versions
          </Typography>
          <Box sx={{ height: 400 }}>
            <BarChart
              layout="horizontal"
              xAxis={[{
                label: 'Installation Count',
              }]}
              series={[
                {
                  data: haVersionCounts,
                  label: 'Installation Count',
                  color: '#7986cb',
                },
              ]}
              yAxis={[{
                scaleType: 'band',
                data: haVersionLabels,
                label: 'Version',
                width: 140
              }]}
              height={350}
              margin={{ top: 20, right: 20, bottom: 70, left: 70 }}
            />
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            PowerCalc Versions
          </Typography>
          <Box sx={{ height: 400 }}>
            <BarChart
              layout="horizontal"
              xAxis={[{
                label: 'Installation Count',
              }]}
              series={[
                {
                  data: pcVersionCounts,
                  label: 'Installation Count',
                  color: '#f50057',
                },
              ]}
              yAxis={[{
                scaleType: 'band',
                data: pcVersionLabels,
                label: 'Version',
                width: 140
              }]}
              height={350}
              margin={{ top: 20, right: 20, bottom: 70, left: 70 }}
            />
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default Installations;