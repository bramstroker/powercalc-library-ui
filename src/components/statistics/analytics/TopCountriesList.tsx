import * as React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  LinearProgress,
  Paper,
} from "@mui/material";
import {CountryStats} from "../../../api/analytics.api";

interface Props {
  data: CountryStats[];
}

export function TopCountriesList({ data }: Props) {
  const top10 = React.useMemo(
      () =>
          [...data]
              .sort((a, b) => b.percentage - a.percentage)
              .slice(0, 10),
      [data]
  );

  return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Top countries
        </Typography>

        <List disablePadding>
          {top10.map((item) => (
              <ListItem key={item.country_code} disableGutters sx={{ mb: 1 }}>
                <Box sx={{ width: "100%" }}>
                  {/* Label row */}
                  <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                  >
                    <ListItemText
                        primary={item.country_code}
                        primaryTypographyProps={{ variant: "body2" }}
                    />

                    <Typography variant="body2" color="text.secondary">
                      {item.percentage.toFixed(1)}%
                    </Typography>
                  </Box>

                  {/* Progress bar */}
                  <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                      }}
                  />
                </Box>
              </ListItem>
          ))}
        </List>
      </Paper>
  );
}