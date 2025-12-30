import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Box,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from "@mui/material";

type StatItem = {
  name: string;
  count: number;
};

type StatisticsDisplayProps = {
  title: string;
  items: StatItem[];
  totalItems: number;
  nameColumnLabel: string;
  filterQueryParam: string;
  onResultsCountChange?: (count: number) => void;
  aggregationsCount: number;
  resultsCount: number;
};

const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({
  title,
  items,
  totalItems,
  nameColumnLabel,
  filterQueryParam,
  onResultsCountChange,
  aggregationsCount,
  resultsCount
}) => {
  const [count, setCount] = useState<number>(resultsCount);

  const handleCountChange = (event: SelectChangeEvent<number>) => {
    const newCount = event.target.value as number;
    setCount(newCount);
    if (onResultsCountChange) {
      onResultsCountChange(newCount);
    }
  };

  return (
    <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="results-count-label">Show</InputLabel>
            <Select
              labelId="results-count-label"
              value={count}
              label="Show"
              onChange={handleCountChange}
            >
              {Array.from({ length: 10 }, (_, i) => (i + 1) * 10)
                  .filter((value) => value <= aggregationsCount + 10)
                  .map((value) => (
                <MenuItem key={value} value={value}>{value} results</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>{nameColumnLabel}</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.name}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Link href={`/?${encodeURIComponent(filterQueryParam)}=${encodeURIComponent(item.name)}`}>
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell align="right">{item.count}</TableCell>
                  <TableCell align="right">
                    {totalItems > 0 ? `${((item.count / totalItems) * 100).toFixed(1)}%` : '0%'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Based on data from {totalItems} power profiles in the library.
          </Typography>
        </Box>
    </>
  );
};

export default StatisticsDisplay;
