import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import {Chip, Tooltip} from "@mui/material";

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: 'up' | 'down' | 'neutral';
  trendAmount?: string;
  hideTrendIcon?: boolean;
  tooltip?: string;
  data: Array<{
    label: string;
    value: number;
  }>;
};


function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
      <defs>
        <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
  );
}

export default function StatCard({
                                   title,
                                   value,
                                   interval,
                                   trend,
                                   trendAmount,
                                   hideTrendIcon,
                                   tooltip,
                                   data,
                                 }: StatCardProps) {
  const theme = useTheme();
  const chartValues = data.map(item => item.value);
  const chartLabels = data.map(item => item.label);

  const trendColors = {
    up:
        theme.palette.mode === 'light'
            ? theme.palette.success.main
            : theme.palette.success.dark,
    down:
        theme.palette.mode === 'light'
            ? theme.palette.error.main
            : theme.palette.error.dark,
    neutral:
        theme.palette.mode === 'light'
            ? theme.palette.grey[400]
            : theme.palette.grey[700],
  };

  const labelColors = {
    up: 'success' as const,
    down: 'error' as const,
    neutral: 'default' as const,
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];

  return (
      <Card variant="elevation"
            sx={{display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1}}>
        <CardContent>
          {tooltip ? (
            <Tooltip title={tooltip} arrow>
              <Typography component="h2" variant="subtitle2" gutterBottom>
                {title}
              </Typography>
            </Tooltip>
          ) : (
            <Typography component="h2" variant="subtitle2" gutterBottom>
              {title}
            </Typography>
          )}
          <Stack
              direction="column"
              sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
          >
            <Stack sx={{ justifyContent: 'space-between' }}>
              <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography variant="h4" component="p">
                  {value}
                </Typography>
                { !hideTrendIcon && <Chip size="small" color={color} label={trendAmount} /> }
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {interval}
              </Typography>
            </Stack>
            <Box sx={{ width: '100%', height: 50 }}>
              <SparkLineChart
                  color={chartColor}
                  data={chartValues}
                  area
                  showHighlight
                  showTooltip
                  xAxis={{
                    scaleType: 'band',
                    data: chartLabels,
                  }}
                  sx={{
                    [`& .${areaElementClasses.root}`]: {
                      fill: `url(#area-gradient-${value})`,
                    },
                  }}
              >
                <AreaGradient color={chartColor} id={`area-gradient-${value}`} />
              </SparkLineChart>
            </Box>
          </Stack>
        </CardContent>
      </Card>
  );
}
