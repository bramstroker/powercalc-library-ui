import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchSummary, Summary } from "../api/analytics.api";

export const useSummary = () => {
  return useSuspenseQuery<Summary>({
    queryKey: ["summary"],
    queryFn: fetchSummary,
  });
};