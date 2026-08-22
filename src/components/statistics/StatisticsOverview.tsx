import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ElectricalServicesOutlinedIcon from "@mui/icons-material/ElectricalServicesOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { Box, Card, CardActionArea, CardContent, Grid, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

import { PageBreadcrumbs } from "../PageBreadcrumbs";

const reports = [
  {
    title: "Most-used measurement devices",
    description: "See which power meters are used most often to create library profiles.",
    path: "/statistics/top-measure-devices",
    icon: ElectricalServicesOutlinedIcon,
  },
  {
    title: "Top contributors",
    description: "Discover the contributors who have added the most profiles to the library.",
    path: "/statistics/top-contributors",
    icon: GroupOutlinedIcon,
  },
  {
    title: "Top manufacturers",
    description: "Compare manufacturers by the number of device profiles in the library.",
    path: "/statistics/top-manufacturers",
    icon: FactoryOutlinedIcon,
  },
  {
    title: "Top device types",
    description: "Explore which kinds of devices are represented most often.",
    path: "/statistics/top-device-types",
    icon: CategoryOutlinedIcon,
  },
  {
    title: "Weekly contributions",
    description: "Follow the number of new profiles added to the library each week.",
    path: "/statistics/weekly-contributions",
    icon: CalendarMonthOutlinedIcon,
  },
];

export const StatisticsOverview = () => (
  <>
    <PageBreadcrumbs items={[{ label: "Home", to: "/" }, { label: "Statistics" }]} />
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Library statistics
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Explore profile rankings, library coverage, and contribution trends.
      </Typography>
    </Box>

    <Grid container spacing={3}>
      {reports.map(({ title, description, path, icon: Icon }) => (
        <Grid key={path} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardActionArea component={RouterLink} to={path} sx={{ height: "100%" }}>
              <CardContent>
                <Icon color="primary" sx={{ mb: 1.5 }} />
                <Typography variant="h6" component="h2" gutterBottom>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  </>
);
