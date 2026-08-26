import { queryOptions } from "@tanstack/react-query";

import { fetchSummary } from "../api/analytics.api";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const dailySummaryQuery = () =>
  queryOptions({
    queryKey: ["summary"],
    queryFn: ({ signal }) => fetchSummary(signal),
    staleTime: ONE_DAY_MS,
  });
