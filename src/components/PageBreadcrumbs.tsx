import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

import { breadcrumbStructuredData, type BreadcrumbItem } from "../seo/breadcrumbs";
import { StructuredData } from "../seo/StructuredData";

export type { BreadcrumbItem };

type PageBreadcrumbsProps = {
  items: BreadcrumbItem[];
  includeStructuredData?: boolean;
};

export const PageBreadcrumbs = ({ items, includeStructuredData = true }: PageBreadcrumbsProps) => (
  <>
    {includeStructuredData && <StructuredData graph={[breadcrumbStructuredData(items)]} />}
    <Breadcrumbs
      aria-label="Breadcrumb"
      maxItems={4}
      sx={{
        mb: 2,
        overflow: "hidden",
        "& ol": { flexWrap: "nowrap" },
        "& li": { minWidth: 0, flexShrink: 0 },
        "& li:last-child": { flexShrink: 1 },
      }}
    >
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;
        const overflowStyles = {
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        } as const;

        return item.to && !isCurrent ? (
          <Link
            component={RouterLink}
            to={item.to}
            prefetch="intent"
            color="inherit"
            underline="hover"
            key={`${item.to}-${item.label}`}
            sx={overflowStyles}
          >
            {item.label}
          </Link>
        ) : (
          <Typography
            color="text.primary"
            aria-current={isCurrent ? "page" : undefined}
            key={`${item.to ?? "current"}-${item.label}`}
            sx={overflowStyles}
          >
            {item.label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  </>
);
