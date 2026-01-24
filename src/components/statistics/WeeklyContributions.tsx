import { Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";

import { useLibrary } from "../../context/LibraryContext";

import {Grouping, TimeSeriesChart} from "./analytics/TimeSeriesChart";

type WeekData = {
  date: string;
  count: number;
};

export const WeeklyContributions = () => {
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const { powerProfiles } = useLibrary();

  useEffect(() => {
    if (powerProfiles.length > 0) {
      const weekCounts: Record<string, number> = {};

      powerProfiles.forEach(profile => {
        const day = profile.createdAt.getDay();
        const diff = profile.createdAt.getDate() - day;
        const weekStart = new Date(profile.createdAt);
        weekStart.setDate(diff);

        // Format as YYYY-MM-DD
        const weekKey = weekStart.toISOString().split('T')[0];

        weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1;
      });

      // Convert to array and sort by date
      const sortedData = Object.entries(weekCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setWeeklyData(sortedData);
    }
  }, [powerProfiles]);

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contributions Per Week
        </Typography>
        <Typography variant="body1" gutterBottom>
          This chart shows the number of power profiles contributed each week.
        </Typography>
      </Box>

      {weeklyData.length > 0 ? (
        <TimeSeriesChart 
          series={weeklyData} 
          label="Contributions" 
          chartType="bar"
          grouping={Grouping.Week}
          height={400}
        />
      ) : (
        <Typography variant="body1">Loading data...</Typography>
      )}

      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Based on data from {powerProfiles.length} power profiles in the library.
        </Typography>
      </Box>
    </>
  );
};