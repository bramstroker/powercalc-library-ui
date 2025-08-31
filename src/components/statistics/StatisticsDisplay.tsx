import React from "react";
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
  Box 
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
};

const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({
  title,
  items,
  totalItems,
  loading,
  error,
  nameColumnLabel
}) => {
  return (
    <>
      <Header total={totalItems} />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>

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
                    <TableCell>{item.name}</TableCell>
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