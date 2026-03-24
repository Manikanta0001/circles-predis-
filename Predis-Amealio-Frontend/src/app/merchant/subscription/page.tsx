'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function SubscriptionPage() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: [
        '10 content generations/month',
        '5 scheduled posts',
        '1 platform connection',
        'Basic analytics',
      ],
      current: true,
    },
    {
      name: 'Basic',
      price: '₹999',
      period: 'month',
      features: [
        '100 content generations/month',
        '50 scheduled posts',
        '3 platform connections',
        'Advanced analytics',
        'Priority support',
      ],
      current: false,
    },
    {
      name: 'Pro',
      price: '₹2,999',
      period: 'month',
      features: [
        '500 content generations/month',
        '200 scheduled posts',
        '10 platform connections',
        'Advanced analytics',
        'Video generation',
        'White-label options',
        '24/7 support',
      ],
      current: false,
    },
    {
      name: 'Enterprise',
      price: '₹9,999',
      period: 'month',
      features: [
        'Unlimited content generations',
        'Unlimited scheduled posts',
        'Unlimited platforms',
        'Custom AI models',
        'Dedicated account manager',
        'API access',
        'Custom integrations',
      ],
      current: false,
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-muted-foreground mb-8">
          Choose the perfect plan for your social media needs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.current ? 'border-primary border-2' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  {plan.current && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.current ? 'outline' : 'default'}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
