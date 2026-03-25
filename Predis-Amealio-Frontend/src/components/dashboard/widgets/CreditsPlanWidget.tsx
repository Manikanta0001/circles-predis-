'use client';

import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CreditsPlanWidget({
  credits,
  subscriptionTier,
}: {
  credits: number;
  subscriptionTier: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Credits & plan</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/merchant/subscription">Manage</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm">
              <span className="text-muted-foreground">Plan:</span>{' '}
              <span className="font-medium capitalize">{subscriptionTier || 'free'}</span>
            </div>
            <div className="text-sm mt-1">
              <span className="text-muted-foreground">Credits:</span>{' '}
              <span className="font-medium">{Number(credits || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

