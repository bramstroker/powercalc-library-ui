import { useSuspenseQuery } from "@tanstack/react-query";

import type { Summary } from "../api/analytics.api";
import { fetchSummary } from "../api/analytics.api";

export const useSummary = () => {
  return useSuspenseQuery<Summary>({
    queryKey: ["summary"],
    queryFn: fetchSummary,
  });
};