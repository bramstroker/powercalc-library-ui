import BarChartIcon from "@mui/icons-material/BarChart";
import TableChartIcon from "@mui/icons-material/TableChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import { Grid, Card, CardContent, CardActions, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { AnalyticsHeader } from "./AnalyticsHeader";

export const AnalyticsOverview = () => {
  return (
    <>
      <AnalyticsHeader
        title="Analytics Dashboards"
        description="Overview of PowerCalc analytics dashboards providing insights into usage patterns and statistics."
      />

      <Grid container spacing={4}>
        <Grid size={{xs:12, md:4}}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Sensor Usage
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Explore sensor usage statistics across different dimensions with interactive pie charts. 
                See how Powercalc sensors are distributed by device_type, strategies, and other categories.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/analytics/sensor-dimensions"
                variant="contained"
              >
                View Dashboard
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid size={{xs:12, md:4}}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Installation Statistics
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                View installation statistics including Home Assistant and Powercalc versions used in installations.
                See trends in opt-ins, total sensors, and geographical distribution.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/analytics/installations"
                variant="contained"
              >
                View Dashboard
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid size={{xs:12, md:4}}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TableChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Profile Usage
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Analyze profile usage statistics with detailed data on which library profiles are most popular.
                See the number of sensors and installations for each profile, sorted by usage percentage.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/analytics/profiles"
                variant="contained"
              >
                View Dashboard
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

