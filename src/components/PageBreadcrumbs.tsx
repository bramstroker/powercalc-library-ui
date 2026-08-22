import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

import type { BreadcrumbItem } from "../seo/breadcrumbs";

export type { BreadcrumbItem };

export const PageBreadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 2 }}>
    {items.map((item, index) => {
      const isCurrent = index === items.length - 1;
      return item.to && !isCurrent ? (
        <Link
          component={RouterLink}
          to={item.to}
          prefetch="intent"
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
