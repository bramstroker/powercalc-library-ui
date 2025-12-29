import * as React from "react";
import {
  Typography,
  LinearProgress,
  Stack, Card, CardContent,
} from "@mui/material";
import {CountryStats} from "../../../api/analytics.api";
import ReactCountryFlag from "react-country-flag";
import Avatar from "@mui/material/Avatar";

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

  const remainingPercentage = React.useMemo(() => {
      const top10Total = top10.reduce((sum, country) => sum + country.percentage, 0);
      return Math.max(0, 100 - top10Total);
  }, [top10]);

  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  function getCountryName(code: string): string {
    return regionNames.of(code.toUpperCase()) ?? code;
  }

  return (
      <Card
          variant="elevation"
          sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Users by country
          </Typography>
          {top10.map((country, index) => (
              <Stack
                  key={index}
                  direction="row"
                  sx={{ alignItems: 'center', gap: 2, pb: 2 }}
              >
                <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: "transparent",
                    }}
                >
                  <ReactCountryFlag
                      svg
                      countryCode={country.country_code.toUpperCase()}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                  />
                </Avatar>
                <Stack sx={{ gap: 1, flexGrow: 1 }}>
                  <Stack
                      direction="row"
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                      }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      {getCountryName(country.country_code)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {country.percentage.toFixed(2)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                      variant="determinate"
                      aria-label="Number of users by country"
                      value={country.percentage}
                  />
                </Stack>
              </Stack>
          ))}

          {/* Other entry for remaining percentage */}
          {remainingPercentage > 0 && (
              <Stack
                  direction="row"
                  sx={{ alignItems: 'center', gap: 2, pb: 2 }}
              >
                <div style={{ width: "1.25em", height: "1.25em" }} />
                <Stack sx={{ gap: 1, flexGrow: 1 }}>
                  <Stack
                      direction="row"
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                      }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      Other
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {remainingPercentage.toFixed(2)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                      variant="determinate"
                      aria-label="Number of users from other countries"
                      value={remainingPercentage}
                  />
                </Stack>
              </Stack>
          )}
        </CardContent>
      </Card>
  );
}
