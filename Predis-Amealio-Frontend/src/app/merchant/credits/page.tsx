'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coins, Plus, History } from 'lucide-react';
import { toast } from 'sonner';

export default function CreditsPage() {
  const [credits] = useState(250);
  const [amount, setAmount] = useState('');

  const creditPackages = [
    { amount: 100, price: 499, bonus: 0 },
    { amount: 250, price: 999, bonus: 25 },
    { amount: 500, price: 1899, bonus: 100 },
    { amount: 1000, price: 3499, bonus: 300 },
  ];

  const transactions = [
    { id: 1, type: 'purchase', amount: 250, date: '2024-01-15', status: 'completed' },
    { id: 2, type: 'usage', amount: -50, date: '2024-01-14', description: 'AI Image Generation' },
    { id: 3, type: 'usage', amount: -25, date: '2024-01-13', description: 'Text Content Generation' },
  ];

  const handlePurchase = (pkg: any) => {
    toast.success('Purchase initiated', {
      description: `Purchasing ${pkg.amount + pkg.bonus} credits for ₹${pkg.price}`
    });
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Credits & Usage</h1>

        {/* Current Balance */}
        <Card className="mb-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <CardContent className="py-8">
            <div className="text-center">
              <Coins className="h-16 w-16 mx-auto mb-4 opacity-90" />
              <p className="text-lg opacity-90 mb-2">Available Credits</p>
              <p className="text-5xl font-bold">{credits.toLocaleString()}</p>
              <p className="text-sm opacity-75 mt-2">1 credit ≈ 1 AI generation</p>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Packages */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buy Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {creditPackages.map((pkg) => (
                <div 
                  key={pkg.amount}
                  className="border-2 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="text-center">
                    <p className="text-3xl font-bold mb-1">{pkg.amount}</p>
                    {pkg.bonus > 0 && (
                      <p className="text-sm text-green-600 font-medium mb-2">
                        +{pkg.bonus} Bonus
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mb-1">credits</p>
                    <p className="text-2xl font-bold text-primary mb-3">₹{pkg.price}</p>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => handlePurchase(pkg)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Buy Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{txn.type}</p>
                    {txn.description && (
                      <p className="text-sm text-muted-foreground">{txn.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{txn.date}</p>
                  </div>
                  <div className={`text-lg font-bold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.amount > 0 ? '+' : ''}{txn.amount}
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
