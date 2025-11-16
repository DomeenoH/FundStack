'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

interface Analytics {
  summary: {
    total_donors: number;
    confirmed_donors: number;
    pending_donations: number;
    total_amount: number;
    confirmed_amount: number;
    pending_amount: number;
    average_donation: number;
  };
  payment_methods: Record<string, { count: number; amount: number }>;
  recent_trends: {
    last_7_days: { count: number; total: number };
  };
  top_donors: Array<{ name: string; amount: number; date: string }>;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Donors</p>
              <p className="text-3xl font-bold">{analytics.summary.total_donors}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold">¥{analytics.summary.total_amount.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-3xl font-bold">¥{analytics.summary.confirmed_amount.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Donation</p>
              <p className="text-3xl font-bold">¥{analytics.summary.average_donation.toFixed(2)}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500 opacity-20" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Payment Method Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.payment_methods).map(([method, data]) => (
            <div key={method} className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 capitalize">{method}</p>
              <p className="text-2xl font-bold">{data.count}</p>
              <p className="text-sm text-gray-500">¥{data.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Top Donors</h3>
        <div className="space-y-2">
          {analytics.top_donors.length > 0 ? (
            analytics.top_donors.map((donor, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{donor.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(donor.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold text-lg">¥{donor.amount.toFixed(2)}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No donors yet</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Recent Trends</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Last 7 Days</p>
            <p className="text-2xl font-bold">
              {analytics.recent_trends.last_7_days.count} donations
            </p>
            <p className="text-sm text-gray-500">
              ¥{analytics.recent_trends.last_7_days.total.toFixed(2)} total
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
