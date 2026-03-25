'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { DailyTrendPoint } from '@/lib/api/content';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const chartConfig = {
  views: { label: 'Views', color: 'hsl(217 91% 60%)' },
  likes: { label: 'Likes', color: 'hsl(330 81% 60%)' },
  shares: { label: 'Shares', color: 'hsl(142 71% 45%)' },
};

export function EngagementTrendChart({
  data,
  rangeDays = 30,
}: {
  data: DailyTrendPoint[];
  rangeDays?: number;
}) {
  const hasEngagement = data.some(
    (d) => d.views + d.likes + d.shares > 0,
  );
  const shouldUseDemoPreview =
    process.env.NODE_ENV === 'development' &&
    !hasEngagement &&
    data.length > 0;

  const demoData: DailyTrendPoint[] = shouldUseDemoPreview
    ? data.map((d, idx) => {
        // Deterministic "dummy" curve so the UI is previewable in dev.
        const n = idx / Math.max(1, data.length - 1);
        const wave = Math.sin(n * Math.PI * 2) * 0.5 + 0.5; // 0..1
        const trend = 0.25 + n * 0.75; // 0.25..1
        const views = Math.round(120 + wave * 500 * trend);
        const likes = Math.round(10 + wave * 60 * trend);
        const shares = Math.round(2 + wave * 18 * trend);
        return { ...d, views, likes, shares };
      })
    : data;
  const tickInterval =
    rangeDays > 14 ? Math.max(0, Math.floor(rangeDays / 10) - 1) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement over time</CardTitle>
        <CardDescription>
          Views, likes, and shares recorded per day in the selected range.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        {!hasEngagement && !shouldUseDemoPreview ? (
          <p className="text-sm text-muted-foreground px-6 py-8 text-center">
            No analytics in this period yet. Publish content and sync metrics to
            see trends.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            {shouldUseDemoPreview ? (
              <p className="px-0 pb-2 text-xs text-muted-foreground">
                
              </p>
            ) : null}
            <LineChart
              data={demoData}
              margin={{ left: 8, right: 12, top: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={tickInterval}
              />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="views"
                stroke="var(--color-views)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="likes"
                stroke="var(--color-likes)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="shares"
                stroke="var(--color-shares)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
