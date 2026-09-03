import { useSuspenseQuery } from "@tanstack/react-query";

import { dailySummaryQuery } from "../queries/analytics.query";

export const useSummary = () => useSuspenseQuery(dailySummaryQuery());
