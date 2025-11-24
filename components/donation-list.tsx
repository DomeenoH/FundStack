'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCcw } from 'lucide-react';
import { getUserAvatarUrl, maskContact } from '@/lib/avatar-utils';
import { Tooltip } from '@/components/ui/tooltip';
import { fetchJson } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Donation {
  id: number | string;
  user_name: string;
  user_email?: string;
  user_url?: string;
  amount: number | string;
  payment_method: string;
  user_message?: string;
  created_at: string;
  status: string;
  donation_count?: number;
  reply_content?: string;
  reply_at?: string;
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

export interface DonationListRef {
  refresh: () => void;
}

const DonationList = forwardRef<DonationListRef, { limit?: number; merge?: boolean }>(
  ({ limit, merge = false }, ref) => {
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

    useImperativeHandle(ref, () => ({
      refresh: () => {
        setLoading(true);
        const controller = new AbortController();
        loadData(controller)
          .catch(err => {
            if (err.name !== 'AbortError') {
              setError(err.message || '加载失败，请稍后重试。');
            }
          })
          .finally(() => setLoading(false));
      }
    }));

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
      <div className="w-full space-y-8">
        {error && (
          <Alert variant="destructive" className="flex items-center justify-between gap-4 rounded-xl">
            <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> 重新加载
            </button>
          </Alert>
        )}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">投喂人数</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.total_donors}</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">已提交金额</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">¥{formatAmount(stats.total_amount)}</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">已确认</p>
                <p className="text-3xl font-bold text-green-600 tracking-tight">¥{formatAmount(stats.confirmed_amount)}</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">平均投喂</p>
                <p className="text-3xl font-bold text-blue-600 tracking-tight">
                  ¥{formatAmount(stats.average_donation || 0)}
                </p>
              </div>
            </motion.div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-white/50 border-b border-gray-100/50">
                <tr>
                  <th className="px-8 py-5 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">投喂者</th>
                  <th className="px-8 py-5 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">邮箱/QQ</th>
                  {merge ? (
                    <>
                      <th className="px-8 py-5 text-center font-bold text-gray-500 uppercase tracking-wider text-xs">投喂次数</th>
                      <th className="px-8 py-5 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">总金额</th>
                      <th className="px-8 py-5 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">最近时间</th>
                    </>
                  ) : (
                    <>
                      <th className="px-8 py-5 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">支付方式</th>
                      <th className="px-8 py-5 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">金额</th>
                      <th className="px-8 py-5 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">留言</th>
                      <th className="px-8 py-5 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">状态</th>
                      <th className="px-8 py-5 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">时间</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                <AnimatePresence mode="popLayout">
                  {filteredDonations.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={merge ? 5 : 7} className="px-8 py-16 text-center text-gray-400 font-medium">
                        还没有投喂记录，欢迎成为第一位支持者！
                      </td>
                    </motion.tr>
                  ) : (
                    visibleDonations.map((donation, index) => (
                      <motion.tr
                        key={donation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/60 transition-all duration-200 cursor-pointer group"
                        onClick={() => {
                          // If merged, go to donor profile page; otherwise go to donation detail
                          const path = merge ? `/list/${donation.id}` : `/donation/${donation.id}`;
                          router.push(path);
                        }}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <img src={getUserAvatarUrl(donation.user_email, 40)} alt="avatar" className="w-8 h-8 rounded-full shrink-0" />
                            <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {donation.user_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-gray-600">
                          {maskContact(donation.user_email)}
                        </td>

                        {merge ? (
                          <>
                            <td className="px-8 py-5 text-center text-gray-600 font-medium">
                              {donation.donation_count}
                            </td>
                            <td className="px-8 py-5 text-right font-bold text-gray-900">
                              ¥{formatAmount(donation.amount)}
                            </td>
                            <td className="px-8 py-5 text-gray-400 text-sm font-medium">
                              {formatDateTime(donation.created_at)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-8 py-5">
                              <span className={cn("flex items-center gap-2 text-sm font-semibold", PAYMENT_METHOD_COLORS[donation.payment_method as keyof typeof PAYMENT_METHOD_COLORS])}>
                                {PAYMENT_METHOD_LABELS[donation.payment_method as keyof typeof PAYMENT_METHOD_LABELS]}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right font-bold text-gray-900">
                              ¥{formatAmount(donation.amount)}
                            </td>
                            <td className="px-8 py-5 text-gray-600 truncate max-w-[240px] text-sm flex items-center gap-2">
                              {donation.user_message || '-'}
                              {donation.reply_content && (
                                <Tooltip content={donation.reply_content}>
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600" title="已回复"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg></span>
                                </Tooltip>
                              )}
                            </td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${STATUS_BADGE_STYLES[donation.status as keyof typeof STATUS_BADGE_STYLES] || STATUS_BADGE_STYLES.pending
                                }`}>
                                {STATUS_LABELS[donation.status as keyof typeof STATUS_LABELS] || donation.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-gray-400 text-sm font-medium">
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
);

DonationList.displayName = 'DonationList';

export default DonationList;
