'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Key, Mail, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // AI Keys
    openaiKey: '*********************',
    anthropicKey: '*********************',
    googleKey: '*********************',
    
    // Integrations
    msg91Key: '',
    razorpayKey: '*********************',
    razorpaySecret: '*********************',
    
    // Email
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@amealio.com',
    smtpPassword: '*********************',
    
    // General
    platformName: 'Amealio',
    supportEmail: 'support@amealio.com',
  });

  const handleSave = (category: string) => {
    toast.success('Settings saved', {
      description: `${category} settings have been updated`
    });
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Platform Settings</h1>

        <Tabs defaultValue="ai" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ai">AI Models</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          {/* AI Models */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  AI Model API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>OpenAI API Key</Label>
                  <Input 
                    type="password" 
                    value={settings.openaiKey}
                    onChange={(e) => setSettings({...settings, openaiKey: e.target.value})}
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For GPT-4o, GPT-5, DALL-E models
                  </p>
                </div>

                <div>
                  <Label>Anthropic API Key</Label>
                  <Input 
                    type="password" 
                    value={settings.anthropicKey}
                    onChange={(e) => setSettings({...settings, anthropicKey: e.target.value})}
                    placeholder="sk-ant-..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For Claude Sonnet models
                  </p>
                </div>

                <div>
                  <Label>Google AI API Key</Label>
                  <Input 
                    type="password" 
                    value={settings.googleKey}
                    onChange={(e) => setSettings({...settings, googleKey: e.target.value})}
                    placeholder="AIza..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For Gemini models
                  </p>
                </div>

                <Button onClick={() => handleSave('AI Models')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save AI Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Third-Party Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">MSG91 (SMS & WhatsApp)</h3>
                  <div>
                    <Label>Auth Key</Label>
                    <Input 
                      type="password" 
                      value={settings.msg91Key}
                      onChange={(e) => setSettings({...settings, msg91Key: e.target.value})}
                      placeholder="Enter MSG91 auth key"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Razorpay (Payments)</h3>
                  <div>
                    <Label>Key ID</Label>
                    <Input 
                      type="password" 
                      value={settings.razorpayKey}
                      onChange={(e) => setSettings({...settings, razorpayKey: e.target.value})}
                      placeholder="rzp_..."
                    />
                  </div>
                  <div>
                    <Label>Key Secret</Label>
                    <Input 
                      type="password" 
                      value={settings.razorpaySecret}
                      onChange={(e) => setSettings({...settings, razorpaySecret: e.target.value})}
                      placeholder="Secret key"
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('Integrations')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Integration Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Host</Label>
                    <Input 
                      value={settings.smtpHost}
                      onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>SMTP Port</Label>
                    <Input 
                      value={settings.smtpPort}
                      onChange={(e) => setSettings({...settings, smtpPort: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>SMTP Username</Label>
                  <Input 
                    value={settings.smtpUser}
                    onChange={(e) => setSettings({...settings, smtpUser: e.target.value})}
                  />
                </div>

                <div>
                  <Label>SMTP Password</Label>
                  <Input 
                    type="password" 
                    value={settings.smtpPassword}
                    onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                  />
                </div>

                <Button onClick={() => handleSave('Email')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Email Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Platform Name</Label>
                  <Input 
                    value={settings.platformName}
                    onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Support Email</Label>
                  <Input 
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                  />
                </div>

                <Button onClick={() => handleSave('General')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
