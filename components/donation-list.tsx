'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Donation {
  id: number;
  user_name: string;
  user_url?: string;
  amount: number;
  payment_method: string;
  user_message?: string;
  created_at: string;
  status: string; // 添加状态字段
}

interface Stats {
  total_donors: number;
  total_amount: number;
  confirmed_amount: number;
  average_donation: number;
}

const PAYMENT_METHOD_COLORS = {
  wechat: 'text-green-600',
  alipay: 'text-blue-600',
  qq: 'text-red-600',
  other: 'text-gray-600',
};

const PAYMENT_METHOD_LABELS = {
  wechat: 'WeChat',
  alipay: 'Alipay',
  qq: 'QQ Pay',
  other: 'Other',
};

const STATUS_BADGE_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
};

export default function DonationList() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donationsRes, statsRes] = await Promise.all([
          fetch('/api/donations/list'),
          fetch('/api/donations'),
        ]);

        if (donationsRes.ok) {
          const donationsData = await donationsRes.json();
          setDonations(donationsData.donations || []);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch donation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Donors</p>
            <p className="text-3xl font-bold">{stats.total_donors}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-3xl font-bold">¥{stats.total_amount.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Confirmed</p>
            <p className="text-3xl font-bold">¥{stats.confirmed_amount.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Avg Donation</p>
            <p className="text-3xl font-bold">
              ¥{(stats.average_donation || 0).toFixed(2)}
            </p>
          </Card>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Donor</th>
              <th className="px-4 py-3 text-left font-medium">Method</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Message</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {donations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No donations yet. Be the first to support us!
                </td>
              </tr>
            ) : (
              donations.map(donation => (
                <tr key={donation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {donation.user_url ? (
                      <a
                        href={donation.user_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {donation.user_name}
                      </a>
                    ) : (
                      donation.user_name
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={PAYMENT_METHOD_COLORS[donation.payment_method as keyof typeof PAYMENT_METHOD_COLORS]}>
                      {PAYMENT_METHOD_LABELS[donation.payment_method as keyof typeof PAYMENT_METHOD_LABELS]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ¥{donation.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate">
                    {donation.user_message || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      STATUS_BADGE_STYLES[donation.status as keyof typeof STATUS_BADGE_STYLES] || STATUS_BADGE_STYLES.pending
                    }`}>
                      {STATUS_LABELS[donation.status as keyof typeof STATUS_LABELS] || donation.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
