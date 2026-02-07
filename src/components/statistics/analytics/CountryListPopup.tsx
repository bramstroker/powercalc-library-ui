import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Avatar, useMediaQuery, useTheme,
} from "@mui/material";
import * as React from "react";
import ReactCountryFlag from "react-country-flag";

import type { CountryStats } from "../../../api/analytics.api";

interface CountryListPopupProps {
  open: boolean;
  onClose: () => void;
  data: CountryStats[];
}

export const CountryListPopup = ({ open, onClose, data }: CountryListPopupProps) => {
  const sortedData = React.useMemo(
    () => [...data].sort((a, b) => b.percentage - a.percentage),
    [data]
  );

  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  const getCountryName = (code: string): string => {
    return regionNames.of(code.toUpperCase()) ?? code;
  };

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="country-list-dialog-title"
    >
      <DialogTitle id="country-list-dialog-title">
        All Countries ({data.length} unique)
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Country</TableCell>
                <TableCell align="right">Installation Count</TableCell>
                <TableCell align="right">Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((country, index) => (
                <TableRow key={country.country_code}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: "transparent",
                          mr: 2,
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
                    <Typography variant="body2">
                      {getCountryName(country.country_code)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {country.installation_count.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {country.percentage.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};