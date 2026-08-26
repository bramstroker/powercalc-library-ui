import { useSuspenseQuery } from "@tanstack/react-query";

import { dailySummaryQuery } from "../queries/summary.query";

// Shares `dailySummaryQuery` rather than redeclaring the key: a second definition of `["summary"]`
// without its `staleTime` made these observers refetch on the client default of five minutes while
// the profile route treated the very same cache entry as fresh for a day.
export const useSummary = () => useSuspenseQuery(dailySummaryQuery());
