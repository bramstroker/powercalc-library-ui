import React, { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from "@mui/material";
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { useQuery } from "@tanstack/react-query";

import { fetchDimensionCounts, DimensionCount } from "../../api/library.api";
import { Header } from "../Header";

// Group dimension counts by dimension
const groupByDimension = (data: DimensionCount[]) => {
  const grouped: Record<string, DimensionCount[]> = {};
  
  data.forEach(item => {
    if (!grouped[item.dimension]) {
      grouped[item.dimension] = [];
    }
    grouped[item.dimension].push(item);
  });
  
  return grouped;
};

const DimensionCounts: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'count' | 'installation_count'>('count');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['dimensionCounts'],
    queryFn: fetchDimensionCounts
  });
  
  const handleMetricChange = (event: SelectChangeEvent<string>) => {
    setSelectedMetric(event.target.value as 'count' | 'installation_count');
  };
  
  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
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
            Error loading dimension counts: {error instanceof Error ? error.message : 'Unknown error'}
          </Typography>
        </Container>
      </>
    );
  }
  
  const groupedData = data ? groupByDimension(data) : {};
  const dimensions = Object.keys(groupedData).sort();
  
  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            PowerCalc Statistics
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="metric-select-label">Metric</InputLabel>
            <Select
              labelId="metric-select-label"
              value={selectedMetric}
              label="Metric"
              onChange={handleMetricChange}
            >
              <MenuItem value="count">Total Count</MenuItem>
              <MenuItem value="installation_count">Installation Count</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Grid container spacing={4}>
          {dimensions.map(dimension => {
            const dimensionData = groupedData[dimension];
            // Sort by count in descending order
            const sortedData = [...dimensionData].sort((a, b) => 
              b[selectedMetric] - a[selectedMetric]
            );
            
            // Prepare data for the pie chart
            const chartData = sortedData.map(item => ({
              id: item.key_name,
              value: item[selectedMetric],
              label: item.key_name
            }));
            
            return (
              <Grid item xs={12} md={6} key={dimension}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {dimension.replace('by_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                  <Box sx={{ height: 300, position: 'relative' }}>
                    <PieChart
                      series={[
                        {
                          data: chartData,
                          highlightScope: { faded: 'global', highlighted: 'item' },
                          faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          arcLabel: (item) => `${item.label} (${item.value})`,
                          arcLabelMinAngle: 10,
                        },
                      ]}
                      sx={{
                        [`& .${pieArcLabelClasses.root}`]: {
                          fill: 'white',
                          fontSize: 14,
                        },
                      }}
                      height={300}
                      margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                      slotProps={{
                        legend: { hidden: true },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </>
  );
};

export default DimensionCounts;