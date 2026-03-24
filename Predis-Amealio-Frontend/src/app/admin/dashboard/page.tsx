'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      toast.error('Error', {
        description: 'Failed to load dashboard data',
      });
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

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500', change: '+12%' },
    { title: 'Active Users', value: stats?.activeUsers || 0, icon: TrendingUp, color: 'text-green-500', change: '+8%' },
    { title: 'Total Content', value: stats?.totalContent || 0, icon: FileText, color: 'text-purple-500', change: '+24%' },
    { title: 'Revenue (Monthly)', value: `₹${(stats?.revenueThisMonth || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', change: '+15%' },
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-500 mt-1">{stat.change} from last month</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Users by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Merchants</span>
                  <span className="text-2xl font-bold text-blue-600">{stats?.usersByRole?.merchant || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Admins</span>
                  <span className="text-2xl font-bold text-purple-600">{stats?.usersByRole?.admin || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Published</span>
                  <span className="text-2xl font-bold text-green-600">{stats?.contentByStatus?.published || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scheduled</span>
                  <span className="text-2xl font-bold text-blue-600">{stats?.contentByStatus?.scheduled || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Drafts</span>
                  <span className="text-2xl font-bold text-gray-600">{stats?.contentByStatus?.draft || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentSignups?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent signups</p>
            ) : (
              <div className="space-y-4">
                {stats?.recentSignups?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
