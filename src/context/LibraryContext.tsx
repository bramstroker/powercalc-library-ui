import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchLibrary } from "../api/library.api";
import { analyticsProfilesQuery } from "../queries/analytics.query";
import { buildLibraryData } from "../queries/library.query";

// Analytics enriches the catalogue after it becomes usable; a slow or unavailable metrics
// service must not suspend searching. The dashboard consumes this same analytics query cache.
export const useLibrary = () => {
  const analytics = useQuery(analyticsProfilesQuery());
  const { data: library } = useSuspenseQuery({
    queryKey: ["library", "browse"],
    queryFn: fetchLibrary,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return useMemo(() => buildLibraryData(library, analytics.data), [library, analytics.data]);
};
