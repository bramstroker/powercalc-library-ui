import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import {Card, CardContent} from "@mui/material";

type Point = { date: string; count: number };

export function OptinsChart({ series }: { series: Point[] }) {
  const x = React.useMemo(
      () => series.map((p) => new Date(p.date)), // "YYYY-MM-DD" -> Date
      [series]
  );

  const y = React.useMemo(
      () => series.map((p) => p.count),
      [series]
  );

  return (
      <Card
          variant="elevation"
          sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
      >
        <CardContent>
          <LineChart
              height={320}
              xAxis={[
                {
                  data: x,
                  scaleType: "time",
                  valueFormatter: (d) =>
                      d.toLocaleDateString("nl-NL", { month: "short", day: "2-digit" }),
                },
              ]}
              series={[
                {
                  data: y,
                  label: "Opt-ins",
                  showMark: false,
                },
              ]}
              grid={{ vertical: true, horizontal: true }}
          />
        </CardContent>
      </Card>
  );
}