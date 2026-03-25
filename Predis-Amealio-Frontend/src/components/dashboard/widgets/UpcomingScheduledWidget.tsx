'use client';

import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Item = {
  id: string;
  platform?: string;
  scheduledAt?: string;
  prompt?: string;
};

export function UpcomingScheduledWidget({ items }: { items: Item[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Scheduled this week</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/merchant/calendar">View</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No upcoming scheduled posts.
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((it) => (
              <div key={it.id} className="flex items-start gap-3">
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{it.platform || 'unknown'}</span>
                    {it.scheduledAt ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(it.scheduledAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm font-medium truncate">
                    {it.prompt || 'Scheduled content'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

