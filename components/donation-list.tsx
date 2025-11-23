'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCcw } from 'lucide-react';
import { fetchJson } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Donation {
  id: number | string;
  user_name: string;
  user_url?: string;
  amount: number | string;
  payment_method: string;
  user_message?: string;
  created_at: string;
  status: string;
  donation_count?: number;
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
  pending: '待确认',
  confirmed: '已通过',
  rejected: '已拒绝',
};

export default function DonationList({ limit, merge = false }: { limit?: number; merge?: boolean }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadData = async (controller: AbortController) => {
    setError(null);

    const donationsPromise = fetchJson<{ donations: Donation[] }>(
      `/api/donations/list?merge=${merge}`,
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
          setError('加载投喂数据时遇到一点小状况，请稍后再试哦。');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [merge]);

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
  const visibleDonations = limit ? filteredDonations.slice(0, limit) : filteredDonations;

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-white/50 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-500">投喂人数</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total_donors}</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-white/50 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-500">已提交金额</p>
              <p className="text-3xl font-bold text-gray-800">¥{formatAmount(stats.total_amount)}</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-white/50 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-500">已确认</p>
              <p className="text-3xl font-bold text-green-600">¥{formatAmount(stats.confirmed_amount)}</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 bg-white/50 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-500">平均投喂</p>
              <p className="text-3xl font-bold text-blue-600">
                ¥{formatAmount(stats.average_donation || 0)}
              </p>
            </Card>
          </motion.div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">投喂者</th>
                {merge ? (
                  <>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">投喂次数</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">总金额</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">最近时间</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">方式</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">金额</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">留言</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">状态</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">时间</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredDonations.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={merge ? 4 : 6} className="px-4 py-8 text-center text-gray-500">
                      还没有投喂记录，欢迎成为第一位支持者！
                    </td>
                  </motion.tr>
                ) : (
                  visibleDonations.map((donation, index) => (
                    <motion.tr
                      key={donation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-white/80 transition-colors ${merge ? 'cursor-pointer' : ''}`}
                      onClick={() => merge && router.push(`/list/${donation.id}`)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {donation.user_url ? (
                          <a
                            href={donation.user_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {donation.user_name}
                          </a>
                        ) : (
                          donation.user_name
                        )}
                      </td>

                      {merge ? (
                        <>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {donation.donation_count}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            ¥{formatAmount(donation.amount)}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {formatDateTime(donation.created_at)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">
                            <span className={cn("flex items-center gap-1", PAYMENT_METHOD_COLORS[donation.payment_method as keyof typeof PAYMENT_METHOD_COLORS])}>
                              {PAYMENT_METHOD_LABELS[donation.payment_method as keyof typeof PAYMENT_METHOD_LABELS]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            ¥{formatAmount(donation.amount)}
                          </td>
                          <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                            {donation.user_message || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_STYLES[donation.status as keyof typeof STATUS_BADGE_STYLES] || STATUS_BADGE_STYLES.pending
                              }`}>
                              {STATUS_LABELS[donation.status as keyof typeof STATUS_LABELS] || donation.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {formatDateTime(donation.created_at)}
                          </td>
                        </>
                      )}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
