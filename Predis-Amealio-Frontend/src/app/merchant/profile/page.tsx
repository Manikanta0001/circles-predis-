'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import axios from 'axios';
import { Instagram, Facebook, Linkedin, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  companyName?: string;
  profileImage?: string;
  role: string;
  subscriptionTier: string;
  credits: number;
}

interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  createdAt: string;
}

interface OAuthConfig {
  platform: string;
  name: string;
  icon: any;
  authUrl: string;
  scopes: string[];
  configured: boolean;
}

export default function MerchantProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

  const oauthConfigs: OAuthConfig[] = [
    {
      platform: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      authUrl: '/oauth/instagram',
      scopes: [],
      configured: false,
    },
    {
      platform: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      authUrl: '/oauth/facebook',
      scopes: ['pages_manage_posts', 'pages_read_engagement'],
      configured: false,
    },
    {
      platform: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      authUrl: '/oauth/linkedin',
      scopes: ['w_member_social', 'r_liteprofile'],
      configured: false,
    },
    {
      platform: 'google',
      name: 'Google',
      icon: Mail,
      authUrl: '/oauth/google',
      scopes: ['youtube.upload', 'youtube.readonly'],
      configured: false,
    },
  ];

  useEffect(() => {
    fetchProfile();
    fetchSocialAccounts();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        companyName: response.data.companyName || '',
        email: response.data.email || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/social/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSocialAccounts(response.data);
    } catch (error) {
      console.error('Error fetching social accounts:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${backendUrl}/api/user/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleOAuthConnect = (config: OAuthConfig) => {
    // Use Instagram App ID for testing, others use demo
    const clientId = config.platform === 'instagram' ? '2419028528512787' : 'demo_client_id';
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const state = btoa(JSON.stringify({ platform: config.platform, timestamp: Date.now() }));
    
    // Construct OAuth URL
    let oauthUrl = '';
    
    switch (config.platform) {
      case 'instagram':
        oauthUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${config.scopes.join(',')}&response_type=code&state=${state}`;
        break;
      case 'facebook':
        oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${config.scopes.join(',')}&state=${state}`;
        break;
      case 'linkedin':
        oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${config.scopes.join(' ')}&state=${state}`;
        break;
      case 'google':
        oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${config.scopes.map(s => `https://www.googleapis.com/auth/${s}`).join(' ')}&state=${state}`;
        break;
    }

    // Enable redirect for Instagram since we have real credentials
    if (config.platform === 'instagram' && clientId !== 'demo_client_id') {
      console.log('Redirecting to Instagram OAuth:', oauthUrl);
      window.location.href = oauthUrl;
    } else {
      // For demo purposes, show the OAuth URL
      console.log('OAuth URL:', oauthUrl);
      toast.info(`OAuth URL generated: ${config.name}`, {
        description: `Check console for full URL. In production, this would redirect to ${config.name} OAuth.`,
        duration: 5000,
      });
    }
  };

  const handleDisconnect = async (accountId: string, platform: string) => {
    if (!confirm(`Disconnect ${platform}? This will revoke access permissions.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/api/social/accounts/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Account disconnected successfully');
      fetchSocialAccounts();
    } catch (error) {
      toast.error('Failed to disconnect account');
    }
  };

  const isConnected = (platform: string) => {
    return socialAccounts.some((acc) => acc.platform === platform && acc.isActive);
  };

  const getConnectedAccount = (platform: string) => {
    return socialAccounts.find((acc) => acc.platform === platform);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and connected services</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="oauth">Social Media Connections</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.profileImage} />
                    <AvatarFallback>{profile?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-sm text-gray-500 mt-1">JPG, GIF or PNG. Max size 1MB</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled={true}
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Subscription Tier</Label>
                      <div className="mt-2">
                        <Badge className="capitalize">{profile?.subscriptionTier}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Credits Remaining</Label>
                      <div className="mt-2 text-2xl font-bold text-indigo-600">
                        {profile?.credits || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  {editing ? (
                    <>
                      <Button onClick={handleUpdateProfile}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OAuth Tab */}
          <TabsContent value="oauth">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Connections</CardTitle>
                <CardDescription>
                  Connect your social media accounts with OAuth for secure access and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {oauthConfigs.map((config) => {
                  const Icon = config.icon;
                  const connected = isConnected(config.platform);
                  const account = getConnectedAccount(config.platform);

                  return (
                    <div
                      key={config.platform}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{config.name}</h3>
                          <p className="text-sm text-gray-600">
                            {connected ? `Connected as @${account?.accountName}` : 'Not connected'}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {config.scopes.map((scope) => (
                              <span key={scope} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {scope}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {connected ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDisconnect(account!.id, config.name)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleOAuthConnect(config)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">OAuth Integration</p>
                      <p>
                        These connections use OAuth 2.0 for secure authentication. Your credentials are
                        never stored. We only receive an access token with the permissions you grant.
                      </p>
                      <p className="mt-2">
                        <strong>Connected accounts can:</strong> Post content, read analytics, manage
                        scheduled posts. You can revoke access anytime.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
