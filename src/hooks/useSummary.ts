import { useQuery } from "@tanstack/react-query";
import { fetchSummary, Summary } from "../api/analytics.api";

export const useSummary = () => {
  return useQuery<Summary>({
    queryKey: ["summary"],
    queryFn: fetchSummary,
  });
};