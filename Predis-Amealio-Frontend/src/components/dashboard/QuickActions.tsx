'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Plus,
  Hash,
  Image as ImageIcon,
  Calendar,
  Folder,
  LineChart,
} from 'lucide-react';

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClassName: string;
};

export function QuickActions({ className }: { className?: string }) {
  const actions: QuickAction[] = [
    {
      title: 'Create content',
      description: 'Start from scratch with guided steps.',
      href: '/merchant/create',
      icon: Plus,
      accentClassName: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      title: 'Generate caption',
      description: 'Instagram-ready caption in one click.',
      href: '/merchant/create?type=text&platform=instagram&textType=caption&tone=professional',
      icon: Plus,
      accentClassName: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      title: 'Generate hashtags',
      description: 'Brand-safe tags tailored to your brief.',
      href: '/merchant/create?type=text&platform=linkedin&textType=hashtags&tone=professional',
      icon: Hash,
      accentClassName: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      title: 'Create image',
      description: 'Generate a post image with the right ratio.',
      href: '/merchant/create?type=image&platform=instagram&aspectRatio=1:1',
      icon: ImageIcon,
      accentClassName: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      title: 'View calendar',
      description: 'See scheduled posts by date and time.',
      href: '/merchant/calendar',
      icon: Calendar,
      accentClassName: 'bg-slate-50 text-slate-700 border-slate-100',
    },
    {
      title: 'Content library',
      description: 'Edit, schedule, or delete saved items.',
      href: '/merchant/content',
      icon: Folder,
      accentClassName: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    {
      title: 'Analytics',
      description: 'Review performance and trends.',
      href: '/merchant/analytics',
      icon: LineChart,
      accentClassName: 'bg-pink-50 text-pink-700 border-pink-100',
    },
  ];

  return (
    <Card className={cn('mb-6', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.title}
                href={a.href}
                className={cn(
                  'group rounded-xl border bg-white p-4 transition-all',
                  'hover:shadow-md hover:-translate-y-[1px]',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'h-9 w-9 rounded-lg border flex items-center justify-center',
                      a.accentClassName,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-900 group-hover:text-gray-950">
                      {a.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-snug">
                      {a.description}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

