'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, CheckCircle, Eye, ThumbsUp, Share2 } from 'lucide-react';
import RecentContentSection from '@/components/dashboard/RecentContentSection';
import { contentApi, DashboardStats } from '@/lib/api/content';
import { EngagementTrendChart } from '@/components/dashboard/EngagementTrendChart';
import { PlatformBreakdownChart } from '@/components/dashboard/PlatformBreakdownChart';
import { ContentTypeChart } from '@/components/dashboard/ContentTypeChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpcomingScheduledWidget } from '@/components/dashboard/widgets/UpcomingScheduledWidget';
import { RecentDraftsWidget } from '@/components/dashboard/widgets/RecentDraftsWidget';
import { CreditsPlanWidget } from '@/components/dashboard/widgets/CreditsPlanWidget';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const EMPTY_STATS: DashboardStats = {
  totalContent: 0,
  draftedContent: 0,
  scheduledContent: 0,
  publishedContent: 0,
  totalViews: 0,
  totalLikes: 0,
  totalShares: 0,
  recentContent: [],
  range: '30d',
  rangeDays: 30,
  dailyTrend: [],
  platformBreakdown: [],
  contentTypeBreakdown: [],
};

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contentApi.getDashboardStats(range);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setStats({ ...EMPTY_STATS, range, rangeDays: range === '7d' ? 7 : range === '90d' ? 90 : 30 });
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const statCards = [
    { title: 'Total Content', value: (stats?.totalContent ?? 0).toString(), icon: FileText },
    { title: 'Scheduled Posts', value: (stats?.scheduledContent ?? 0).toString(), icon: Calendar },
    { title: 'Published', value: (stats?.publishedContent ?? 0).toString(), icon: CheckCircle },
    { title: 'Total Views', value: (stats?.totalViews ?? 0).toString(), icon: Eye },
    { title: 'Total Likes', value: (stats?.totalLikes ?? 0).toString(), icon: ThumbsUp },
    { title: 'Total Shares', value: (stats?.totalShares ?? 0).toString(), icon: Share2 },
  ];

  const handleContentClick = (content: unknown) => {
    console.log('Navigate to content details:', (content as { id?: string })?.id);
  };

  const handleShareClick = (content: unknown) => {
    console.log('Share content:', (content as { id?: string })?.id);
  };

  const dailyTrend = stats?.dailyTrend ?? [];
  const platformBreakdown = stats?.platformBreakdown ?? [];
  const contentTypeBreakdown = stats?.contentTypeBreakdown ?? [];
  const rangeDays = stats?.rangeDays ?? (range === '7d' ? 7 : range === '90d' ? 90 : 30);
  const widgets = stats?.widgets;

  if (loading) {
    return (
      <DashboardLayout>
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="h-10 w-40 bg-muted rounded-md animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-12 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <div className="h-5 bg-muted rounded w-48 animate-pulse" />
                <div className="h-4 bg-muted rounded w-full max-w-md mt-2 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-[280px] bg-muted/50 rounded animate-pulse" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-5 bg-muted rounded w-48 animate-pulse" />
                <div className="h-4 bg-muted rounded w-full max-w-md mt-2 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-[280px] bg-muted/50 rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
          <Card className="mb-6">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-32 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] bg-muted/50 rounded animate-pulse max-w-md mx-auto" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Label htmlFor="dashboard-range" className="text-sm text-muted-foreground whitespace-nowrap">
              Chart range
            </Label>
            <Select value={range} onValueChange={(v) => setRange(v as '7d' | '30d' | '90d')}>
              <SelectTrigger id="dashboard-range" className="w-[140px]">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <EngagementTrendChart data={dailyTrend} rangeDays={rangeDays} />
          <PlatformBreakdownChart data={platformBreakdown} />
        </div>

        <div className="mb-6 max-w-lg">
          <ContentTypeChart data={contentTypeBreakdown} />
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <UpcomingScheduledWidget items={widgets?.upcomingScheduled ?? []} />
              <RecentDraftsWidget items={widgets?.recentDrafts ?? []} />
              <CreditsPlanWidget
                credits={widgets?.credits ?? 0}
                subscriptionTier={widgets?.subscriptionTier ?? 'free'}
              />
            </div>
          </CardContent>
        </Card>

        <RecentContentSection
          onContentClick={handleContentClick}
          onShareClick={handleShareClick}
        />
      </div>
    </DashboardLayout>
  );
}
