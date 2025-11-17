'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Donation {
  id: number;
  user_name: string;
  user_url?: string;
  amount: number | string;
  payment_method: string;
  user_message?: string;
  created_at: string;
  status: string;
}

interface Stats {
  total_donors: number;
  total_amount: number | string;
  confirmed_amount: number | string;
  average_donation: number | string;
}

const PAYMENT_METHOD_COLORS = {
  wechat: 'text-green-600',
  alipay: 'text-blue-600',
  qq: 'text-red-600',
  other: 'text-gray-600',
};

const PAYMENT_METHOD_LABELS = {
  wechat: '微信',
  alipay: '支付宝',
  qq: 'QQ支付',
  other: '其他',
};

const STATUS_BADGE_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  pending: '待处理',
  confirmed: '已确认',
  rejected: '已拒绝',
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

  const formatAmount = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

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
            <p className="text-sm text-gray-600">捐赠者总数</p>
            <p className="text-3xl font-bold">{stats.total_donors}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">总金额</p>
            <p className="text-3xl font-bold">¥{formatAmount(stats.total_amount)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">已确认</p>
            <p className="text-3xl font-bold">¥{formatAmount(stats.confirmed_amount)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">平均捐赠</p>
            <p className="text-3xl font-bold">
              ¥{formatAmount(stats.average_donation || 0)}
            </p>
          </Card>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium">捐赠者</th>
              <th className="px-4 py-3 text-left font-medium">方式</th>
              <th className="px-4 py-3 text-right font-medium">金额</th>
              <th className="px-4 py-3 text-left font-medium">留言</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">日期</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {donations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  暂无捐赠。成为第一个支持我们的人吧！
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
                    ¥{formatAmount(donation.amount)}
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
                    {new Date(donation.created_at).toLocaleDateString('zh-CN')}
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
