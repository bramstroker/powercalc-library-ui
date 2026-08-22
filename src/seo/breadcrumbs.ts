import { SITE_URL } from "../config/site";

import type { StructuredData } from "./meta";

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export const breadcrumbStructuredData = (items: BreadcrumbItem[]): StructuredData => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: item.to ? `${SITE_URL}${item.to}` : undefined,
  })),
});
