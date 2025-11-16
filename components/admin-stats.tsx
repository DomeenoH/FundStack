'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Stats {
  total_donors: number;
  total_amount: number;
  confirmed_amount: number;
  pending_amount: number;
  average_donation: number;
  monthly_growth: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/donations');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-2">Total Donors</p>
        <p className="text-3xl font-bold">{stats.total_donors}</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-2">Total Amount</p>
        <p className="text-3xl font-bold">¥{stats.total_amount.toFixed(2)}</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-2">Confirmed</p>
        <p className="text-3xl font-bold">¥{stats.confirmed_amount.toFixed(2)}</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-2">Avg Donation</p>
        <p className="text-3xl font-bold">¥{stats.average_donation.toFixed(2)}</p>
      </Card>
    </div>
  );
}
