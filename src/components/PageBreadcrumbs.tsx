import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { SITE_URL } from "../config/site";
import type { StructuredData } from "../hooks/useStructuredData";

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export const breadcrumbStructuredData = (
  items: BreadcrumbItem[],
): StructuredData => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: item.to ? `${SITE_URL}${item.to}` : undefined,
  })),
});

export const PageBreadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 2 }}>
    {items.map((item, index) => {
      const isCurrent = index === items.length - 1;
      return item.to && !isCurrent ? (
        <Link
          component={RouterLink}
          to={item.to}
          color="inherit"
          underline="hover"
          key={`${item.to}-${item.label}`}
        >
          {item.label}
        </Link>
      ) : (
        <Typography
          color="text.primary"
          aria-current={isCurrent ? "page" : undefined}
          key={`${item.to ?? "current"}-${item.label}`}
          sx={{ overflowWrap: "anywhere" }}
        >
          {item.label}
        </Typography>
      );
    })}
  </Breadcrumbs>
);
