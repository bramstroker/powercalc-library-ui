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
  Container, 
  Box,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from "@mui/material";
import { Header } from "../Header";

type StatItem = {
  name: string;
  count: number;
};

type StatisticsDisplayProps = {
  title: string;
  items: StatItem[];
  totalItems: number;
  loading: boolean;
  error: string | null;
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
  loading,
  error,
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
  
  const selectOptions = [];
  for (let i = 10; i <= 100; i+=10) {
    if ((i - 10) <= aggregationsCount) {
      selectOptions.push(i);
    }
  }

  return (
    <>
      <Header total={totalItems} />
      <Container maxWidth="md" sx={{ mt: 4 }}>
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
              {selectOptions.map((value) => (
                <MenuItem key={value} value={value}>{value} results</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading && <Typography>Loading...</Typography>}

        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
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
        )}

        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Based on data from {totalItems} power profiles in the library.
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default StatisticsDisplay;
