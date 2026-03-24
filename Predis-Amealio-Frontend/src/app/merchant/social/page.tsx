'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
  createdAt: string;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresAuth: boolean;
}

export default function SocialMediaPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchAccounts();
    fetchPlatforms();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/social/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/social/platforms`);
      const data = response.data as Platform[];

      if (data && data.length > 0) {
        setPlatforms(data);
      } else {
        setPlatforms([
          {
            id: 'instagram',
            name: 'Instagram',
            icon: 'instagram',
            description: 'Publish posts & schedule content to your Instagram audience.',
            requiresAuth: true,
          },
          {
            id: 'linkedin',
            name: 'LinkedIn',
            icon: 'linkedin',
            description: 'Share professional updates and long-form posts.',
            requiresAuth: true,
          },
          {
            id: 'facebook',
            name: 'Facebook',
            icon: 'facebook',
            description: 'Reach your community with page posts and campaigns.',
            requiresAuth: true,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching platforms:', error);
      // Frontend fallback so the user always sees the core platforms
      setPlatforms([
        {
          id: 'instagram',
          name: 'Instagram',
          icon: 'instagram',
          description: 'Publish posts & schedule content to your Instagram audience.',
          requiresAuth: true,
        },
        {
          id: 'linkedin',
          name: 'LinkedIn',
          icon: 'linkedin',
          description: 'Share professional updates and long-form posts.',
          requiresAuth: true,
        },
        {
          id: 'facebook',
          name: 'Facebook',
          icon: 'facebook',
          description: 'Reach your community with page posts and campaigns.',
          requiresAuth: true,
        },
      ]);
    }
  };

  const handleConnect = async (platform: Platform) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${backendUrl}/api/social/connect`,
        {
          platform: platform.id,
          // In production, this would be created after the OAuth flow.
          accountName: platform.name,
          accessToken: 'demo_token_' + Date.now(), // In real app, this would come from OAuth
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`Connected to ${platform.name} successfully!`);
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to connect account');
    }
  };

  const handleDisconnect = async (accountId: string, platform: string) => {
    if (!confirm(`Are you sure you want to disconnect this ${platform} account?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/api/social/accounts/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Account disconnected successfully');
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to disconnect account');
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: any = {
      instagram: '📷',
      facebook: '👥',
      twitter: '🐦',
      linkedin: '💼',
      tiktok: '🎵',
    };
    return icons[platform] || '📱';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Social Media Accounts</h1>
          <p className="text-gray-600 mt-2">
            Connect your social media accounts to publish content directly from Amealio
          </p>
        </div>

        {/* Connected Accounts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Manage your connected social media accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">No accounts connected yet</p>
                <p className="text-xs text-gray-400">Use the Connect buttons below to link your first platform.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{getPlatformIcon(account.platform)}</div>
                      <div>
                        <h3 className="font-semibold capitalize">{account.platform}</h3>
                        <p className="text-sm text-gray-600">@{account.accountName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {account.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnect(account.id, account.platform)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Platforms */}
        <Card>
          <CardHeader>
            <CardTitle>Connect your platforms</CardTitle>
            <CardDescription>
              Start by connecting Instagram, then add LinkedIn and Facebook to publish and schedule content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {(['instagram', 'linkedin', 'facebook'] as const).map((id) => {
                const platform = platforms.find((p) => p.id === id);
                if (!platform) return null;

                const isConnected = accounts.some((acc) => acc.platform === platform.id);

                const helperTextMap: Record<string, string> = {
                  instagram: 'Publish posts & schedule content to your Instagram audience.',
                  linkedin: 'Share professional updates and long-form posts.',
                  facebook: 'Reach your community with page posts and campaigns.',
                };

                return (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between rounded-xl border bg-white/70 px-4 py-3 shadow-sm hover:shadow-md hover:bg-white transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl">
                        {getPlatformIcon(platform.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{platform.name}</span>
                          {isConnected && (
                            <span className="inline-flex h-5 items-center gap-1 rounded-full bg-green-50 px-2 text-[10px] font-medium text-green-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {helperTextMap[id] || 'Publish posts & schedule content.'}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      disabled={isConnected}
                      onClick={() => handleConnect(platform)}
                      className="min-w-[96px]"
                    >
                      {isConnected ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
