import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for trying out Amealio',
      features: [
        '10 content generations/month',
        '5 scheduled posts',
        '1 platform connection',
        'Basic analytics',
        'Community support',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Basic',
      price: '₹999',
      period: 'month',
      description: 'For growing businesses',
      features: [
        '100 content generations/month',
        '50 scheduled posts',
        '3 platform connections',
        'Advanced analytics',
        'Priority email support',
        'Content calendar',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Pro',
      price: '₹2,999',
      period: 'month',
      description: 'For serious creators',
      features: [
        '500 content generations/month',
        '200 scheduled posts',
        '10 platform connections',
        'Advanced analytics',
        'Video generation',
        'White-label options',
        '24/7 priority support',
        'Custom AI models',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '₹9,999',
      period: 'month',
      description: 'For large organizations',
      features: [
        'Unlimited content generations',
        'Unlimited scheduled posts',
        'Unlimited platforms',
        'Custom AI model training',
        'Dedicated account manager',
        'API access',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#001D51' }}>Simple, Transparent Pricing</h1>
            <p className="text-xl" style={{ color: '#777777' }}>
              Choose the perfect plan for your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary border-2 shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
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

                  <Link href="/signup">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              All plans include 14-day free trial. No credit card required.
            </p>
            <p className="text-sm text-muted-foreground">
              Need a custom plan? <Link href="/contact" className="text-primary hover:underline">Contact our sales team</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
