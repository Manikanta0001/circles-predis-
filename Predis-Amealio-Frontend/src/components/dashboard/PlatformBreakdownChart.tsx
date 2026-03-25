'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { PlatformBreakdownRow } from '@/lib/api/content';
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

export function PlatformBreakdownChart({
  data,
}: {
  data: PlatformBreakdownRow[];
}) {
  const hasData = data.some(
    (d) => d.views + d.likes + d.shares + d.posts > 0,
  );
  const hasEngagement = data.some((d) => d.views + d.likes + d.shares > 0);
  const shouldUseDemoPreview =
    process.env.NODE_ENV === 'development' &&
    !hasEngagement &&
    data.length > 0 &&
    data.some((d) => d.posts > 0);

  const demoData: PlatformBreakdownRow[] = shouldUseDemoPreview
    ? data.map((d, idx) => {
        const n = idx / Math.max(1, data.length - 1);
        const wave = Math.sin(n * Math.PI) * 0.5 + 0.5; // 0..1
        const views = Math.round(200 + wave * 900);
        const likes = Math.round(18 + wave * 120);
        const shares = Math.round(4 + wave * 30);
        const engagementRate =
          views > 0
            ? Math.round(((likes + shares) / views) * 1000) / 10
            : 0;
        return { ...d, views, likes, shares, engagementRate };
      })
    : data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by platform</CardTitle>
        <CardDescription>
          Stacked engagement for each platform in the selected range.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        {!hasData ? (
          <p className="text-sm text-muted-foreground px-6 py-8 text-center">
            No platform data in this period. Tag content with a platform to
            compare performance.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            {shouldUseDemoPreview ? (
              <p className="px-0 pb-0 text-xs text-muted-foreground">
              </p>
            ) : null}
            <BarChart
              data={demoData}
              margin={{ left: 8, right: 12, top: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="platform"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="views"
                stackId="engagement"
                fill="var(--color-views)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="likes"
                stackId="engagement"
                fill="var(--color-likes)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="shares"
                stackId="engagement"
                fill="var(--color-shares)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
