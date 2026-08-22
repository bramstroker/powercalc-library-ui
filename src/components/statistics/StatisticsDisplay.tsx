import type {
  SelectChangeEvent} from "@mui/material";
import { Stack
} from "@mui/material";
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
  MenuItem
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";

import { useLibrary } from "../../context/LibraryContext";
import { authorPath, manufacturerPath } from "../../utils/urlSlugs.mjs";
import { GithubAvatar } from "../GithubAvatar";
import { ManufacturerLogo } from "../ManufacturerLogo";

type StatItem = {
  name: string;
  count: number;
};

/**
 * Aggregation keys manufacturers by full name, but the logo and the manufacturer page are both
 * keyed by directory name, so the row has to look the manufacturer back up.
 */
const ManufacturerCell = ({ fullName }: { fullName: string }) => {
  const { manufacturers } = useLibrary();
  const manufacturer = useMemo(
    () => Object.values(manufacturers).find((entry) => entry.fullName === fullName),
    [manufacturers, fullName],
  );

  if (!manufacturer) {
    return (
      <Link
        component={RouterLink}
        to={`/?manufacturer=${encodeURIComponent(fullName)}`}
        prefetch="intent"
      >
        {fullName}
      </Link>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <ManufacturerLogo manufacturer={manufacturer} size={24} />
      <Link
        component={RouterLink}
        to={manufacturerPath(manufacturer.dirName)}
        prefetch="intent"
      >
        {fullName}
      </Link>
    </Box>
  );
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

export const StatisticsDisplay = ({
  title,
  items,
  totalItems,
  nameColumnLabel,
  filterQueryParam,
  onResultsCountChange,
  aggregationsCount,
  resultsCount
}: StatisticsDisplayProps) => {
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
          <Stack>
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {aggregationsCount} total {nameColumnLabel.toLowerCase()}s
            </Typography>
          </Stack>
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
                    {filterQueryParam === 'author' ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GithubAvatar
                          username={item.name}
                          sx={{ width: 24, height: 24 }}
                        />
                        <Link
                          component={RouterLink}
                          to={authorPath(item.name)}
                          prefetch="intent"
                        >
                          {item.name}
                        </Link>
                      </Box>
                    ) : filterQueryParam === 'manufacturer' ? (
                      <ManufacturerCell fullName={item.name} />
                    ) : (
                      <Link
                        component={RouterLink}
                        to={`/?${encodeURIComponent(filterQueryParam)}=${encodeURIComponent(item.name)}`}
                        prefetch="intent"
                      >
                        {item.name}
                      </Link>
                    )}
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
