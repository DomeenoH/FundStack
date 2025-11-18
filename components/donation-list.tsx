'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCcw } from 'lucide-react';
import { fetchJson } from '@/lib/api';

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
  const [error, setError] = useState<string | null>(null);

  const loadData = async (controller: AbortController) => {
    setError(null);

    const donationsPromise = fetchJson<{ donations: Donation[] }>(
      '/api/donations/list',
      { signal: controller.signal }
    );
    const statsPromise = fetchJson<{ stats: Stats }>(
      '/api/donations',
      { signal: controller.signal }
    );

    const [donationsResult, statsResult] = await Promise.allSettled([
      donationsPromise,
      statsPromise,
    ]);

    let encounteredError = false;

    if (donationsResult.status === 'fulfilled') {
      setDonations(donationsResult.value.donations || []);
    } else if (donationsResult.reason instanceof Error) {
      encounteredError = true;
      setError(donationsResult.reason.message);
    }

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value.stats);
    } else if (statsResult.reason instanceof Error && !encounteredError) {
      setError(statsResult.reason.message);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    loadData(controller)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('[v0] Failed to fetch donation data:', err);
          setError('加载捐赠数据时出现问题，请稍后重试。');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    const controller = new AbortController();
    loadData(controller)
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message || '加载失败，请稍后重试。');
        }
      })
      .finally(() => setLoading(false));
  };

  const formatAmount = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleString('zh-CN', {
      hour12: false,
    });
  };

  const filteredDonations = donations.filter(donation => donation.status !== 'rejected');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {error && (
        <Alert variant="destructive" className="flex items-center justify-between gap-4">
          <AlertDescription className="text-sm">{error}</AlertDescription>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 rounded border px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            <RefreshCcw className="h-4 w-4" /> 重新加载
          </button>
        </Alert>
      )}

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
              <th className="px-4 py-3 text-left font-medium">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredDonations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  暂无捐赠。成为第一个支持我们的人吧！
                </td>
              </tr>
            ) : (
              filteredDonations.map(donation => (
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
                    {formatDateTime(donation.created_at)}
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
