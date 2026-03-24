'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { TrendingUp, Eye, Heart, Share2, MessageCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      toast.error('Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const metrics = [
    { 
      title: 'Total Views', 
      value: analytics?.totalViews || 0, 
      change: analytics?.viewsGrowth || 0,
      icon: Eye, 
      color: 'text-blue-500' 
    },
    { 
      title: 'Total Likes', 
      value: analytics?.totalLikes || 0, 
      change: analytics?.likesGrowth || 0,
      icon: Heart, 
      color: 'text-pink-500' 
    },
    { 
      title: 'Total Shares', 
      value: analytics?.totalShares || 0, 
      change: analytics?.sharesGrowth || 0,
      icon: Share2, 
      color: 'text-green-500' 
    },
    { 
      title: 'Engagement Rate', 
      value: `${analytics?.engagementRate || 0}%`, 
      change: 0,
      icon: TrendingUp, 
      color: 'text-purple-500' 
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Analytics Overview</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}</div>
                  {metric.change !== 0 && (
                    <p className={`text-xs mt-1 ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}% from last month
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Platform Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.platformBreakdown?.map((platform: any) => (
                <div key={platform.platform} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{platform.platform}</h3>
                    <span className="text-sm text-muted-foreground">
                      Engagement: {platform.engagement}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="font-semibold">{platform.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Likes</p>
                      <p className="font-semibold">{platform.likes.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Shares</p>
                      <p className="font-semibold">{platform.shares.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Content */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topContent?.map((content: any, index: number) => (
                <div key={content.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="text-2xl font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{content.title}</h4>
                    <p className="text-sm text-muted-foreground">{content.platform}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{content.views.toLocaleString()}</p>
                      <p className="text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{content.likes.toLocaleString()}</p>
                      <p className="text-muted-foreground">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{content.engagement}%</p>
                      <p className="text-muted-foreground">Engagement</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
