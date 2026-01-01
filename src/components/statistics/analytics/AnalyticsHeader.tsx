import {
  Typography,
  Box,
} from "@mui/material";
import Link from "@mui/material/Link";
import type { ReactNode } from "react";

import {useSummary} from "../../../hooks/useSummary";


interface AnalyticsHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
  rightContent?: ReactNode;
}

export const AnalyticsHeader = ({
  title,
  description,
  children,
  rightContent,
}: AnalyticsHeaderProps) => {
  const summary = useSummary();

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
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

        {rightContent}
      </Box>
    </>
  );
};

