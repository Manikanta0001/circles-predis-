'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, CheckCircle, Eye, ThumbsUp, Share2 } from 'lucide-react';
import RecentContentSection from '@/components/dashboard/RecentContentSection';
import { contentApi, DashboardStats } from '@/lib/api/content';

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard stats...');
      const response = await contentApi.getDashboardStats();
      console.log('Dashboard stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Set default stats on error
      setStats({
        totalContent: 0,
        draftedContent: 0,
        scheduledContent: 0,
        publishedContent: 0,
        totalViews: 0,
        totalLikes: 0,
        totalShares: 0,
        recentContent: []
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Content', value: (stats?.totalContent ?? 0).toString(), icon: FileText },
    { title: 'Scheduled Posts', value: (stats?.scheduledContent ?? 0).toString(), icon: Calendar },
    { title: 'Published', value: (stats?.publishedContent ?? 0).toString(), icon: CheckCircle },
    { title: 'Total Views', value: (stats?.totalViews ?? 0).toString(), icon: Eye },
    { title: 'Total Likes', value: (stats?.totalLikes ?? 0).toString(), icon: ThumbsUp },
    { title: 'Total Shares', value: (stats?.totalShares ?? 0).toString(), icon: Share2 },
  ];

  const handleContentClick = (content: any) => {
    console.log('Navigate to content details:', content.id);
    // Add navigation logic here
  };

  const handleShareClick = (content: any) => {
    console.log('Share content:', content.id);
    // Add share functionality here
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div>
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
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

        <RecentContentSection 
          onContentClick={handleContentClick}
          onShareClick={handleShareClick}
        />
      </div>
    </DashboardLayout>
  );
}

