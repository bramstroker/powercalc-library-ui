import {
  Typography,
  Box,
} from "@mui/material";
import Link from "@mui/material/Link";
import type {PropsWithChildren, ReactNode} from "react";

import {useSummary} from "../../../hooks/useSummary";


interface AnalyticsHeaderProps {
  title: string;
  description: string;
  filterSection?: ReactNode;
}

export const AnalyticsHeader = ({
  title,
  description,
  children,
  filterSection,
}: PropsWithChildren<AnalyticsHeaderProps>) => {
  const summary = useSummary();

  return (
    <>
      <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "flex-start" },
            gap: 2,
            mb: 4,
          }}
      >
        <Box>
          {title && (
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
          )}

          {description && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {description}
            </Typography>
          )}

          {children}

          <Typography variant="caption" color="text.secondary">
            Based on {summary?.data?.sampled_installations ?? 0} active installations
            that opted in to analytics.
            <Link
                href="https://docs.powercalc.nl/misc/analytics/"
                target="_blank"
                rel="noopener noreferrer"
            >
              Learn how to opt-in
            </Link>
          </Typography>
        </Box>

        {filterSection}
      </Box>
    </>
  );
};

