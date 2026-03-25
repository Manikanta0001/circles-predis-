'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Item = {
  id: string;
  platform?: string;
  updatedAt?: string;
  prompt?: string;
};

export function RecentDraftsWidget({ items }: { items: Item[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Drafts to finish</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/merchant/content">Open</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No drafts right now.
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 3).map((it) => (
              <Link
                key={it.id}
                href={`/merchant/create?id=${it.id}`}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/40 transition-colors"
              >
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground flex items-center justify-between gap-2">
                    <span className="capitalize">{it.platform || 'unknown'}</span>
                    {it.updatedAt ? (
                      <span>{new Date(it.updatedAt).toLocaleDateString()}</span>
                    ) : null}
                  </div>
                  <div className="text-sm font-medium truncate">
                    {it.prompt || 'Draft content'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

