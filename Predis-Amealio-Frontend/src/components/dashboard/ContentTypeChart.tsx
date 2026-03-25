'use client';

import * as React from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { ContentTypeBreakdownRow } from '@/lib/api/content';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const COLORS = [
  'hsl(217 91% 60%)',
  'hsl(330 81% 60%)',
  'hsl(142 71% 45%)',
  'hsl(38 92% 50%)',
  'hsl(262 83% 58%)',
];

export function ContentTypeChart({
  data,
}: {
  data: ContentTypeBreakdownRow[];
}) {
  const chartData = data.filter((d) => d.count > 0);
  const hasData = chartData.length > 0;

  const chartConfig = React.useMemo<ChartConfig>(() => {
    const c: ChartConfig = {};
    chartData.forEach((row, i) => {
      c[row.label] = {
        label: row.label,
        color: COLORS[i % COLORS.length],
      };
    });
    return c;
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content mix</CardTitle>
        <CardDescription>
          Items created in the selected range by type (text, image, video).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No new content in this period. Generate or save posts to see the
            breakdown.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto h-[260px] w-full max-w-md">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                innerRadius={48}
                outerRadius={88}
                strokeWidth={1}
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
