'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCcw } from 'lucide-react';
import { getUserAvatarUrl, maskContact } from '@/lib/avatar-utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
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

    const formatDateTime = (dateString: string): { date: string; time: string } => {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return { date: '-', time: '' };
      }

      const date = dateObj.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\//g, '/');

      const time = dateObj.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return { date, time };
    };

    const PaymentIcon = ({ method }: { method: string }) => {
      const iconClass = "w-5 h-5";

      switch (method) {
        case 'alipay':
          return (
            <svg viewBox="0 0 1024 1024" className={iconClass} version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path d="M492.343 777.511c-67.093 32.018-144.129 51.939-227.552 32.27-83.424-19.678-142.626-73.023-132.453-171.512 10.192-98.496 115.478-132.461 202.07-132.461 86.622 0 250.938 56.122 250.938 56.122s13.807-30.937 27.222-66.307c13.405-35.365 17.21-63.785 17.21-63.785H279.869v-35.067h169.995v-67.087l-211.925 1.526v-44.218h211.925v-100.63h111.304v100.629H788.35v44.218l-227.181 1.524v62.511l187.584 1.526s-3.391 35.067-27.17 98.852c-23.755 63.783-46.061 96.312-46.061 96.312L960 685.279V243.2C960 144.231 879.769 64 780.8 64H243.2C144.231 64 64 144.231 64 243.2v537.6C64 879.769 144.231 960 243.2 960h537.6c82.487 0 151.773-55.806 172.624-131.668L625.21 672.744s-65.782 72.748-132.867 104.767z" fill="#1677FF" />
              <path d="M297.978 559.871c-104.456 6.649-129.974 52.605-129.974 94.891s25.792 101.073 148.548 101.073c122.727 0 226.909-123.77 226.909-123.77s-141.057-78.842-245.483-72.194z" fill="#1677FF" />
            </svg>
          );
        case 'wechat':
          return (
            <svg viewBox="0 0 1024 1024" className={iconClass} version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path d="M664.250054 368.541681c10.015098 0 19.892049 0.732687 29.67281 1.795902-26.647917-122.810047-159.358451-214.077703-310.826188-214.077703-169.353083 0-308.085774 114.232694-308.085774 259.274068 0 83.708494 46.165436 152.460344 123.281791 205.78483l-30.80868 91.730191 107.688651-53.455469c38.558178 7.53665 69.459978 15.308661 107.924012 15.308661 9.66308 0 19.230993-0.470721 28.752858-1.225921-6.025227-20.36584-9.521864-41.723264-9.521864-63.862493C402.328693 476.632491 517.908058 368.541681 664.250054 368.541681zM498.62897 285.87389c23.200398 0 38.557154 15.120372 38.557154 38.061874 0 22.846334-15.356756 38.156018-38.557154 38.156018-23.107277 0-46.260603-15.309684-46.260603-38.156018C452.368366 300.994262 475.522716 285.87389 498.62897 285.87389zM283.016307 362.090758c-23.107277 0-46.402843-15.309684-46.402843-38.156018 0-22.941502 23.295566-38.061874 46.402843-38.061874 23.081695 0 38.46301 15.120372 38.46301 38.061874C321.479317 346.782098 306.098002 362.090758 283.016307 362.090758zM945.448458 606.151333c0-121.888048-123.258255-221.236753-261.683954-221.236753-146.57838 0-262.015505 99.348706-262.015505 221.236753 0 122.06508 115.437126 221.200938 262.015505 221.200938 30.66644 0 61.617359-7.609305 92.423993-15.262612l84.513836 45.786813-23.178909-76.17082C899.379213 735.776599 945.448458 674.90216 945.448458 606.151333zM598.803483 567.994292c-15.332197 0-30.807656-15.096836-30.807656-30.501688 0-15.190981 15.47546-30.477129 30.807656-30.477129 23.295566 0 38.558178 15.286148 38.558178 30.477129C637.361661 552.897456 622.099049 567.994292 598.803483 567.994292zM768.25071 567.994292c-15.213493 0-30.594809-15.096836-30.594809-30.501688 0-15.190981 15.381315-30.477129 30.594809-30.477129 23.107277 0 38.558178 15.286148 38.558178 30.477129C806.808888 552.897456 791.357987 567.994292 768.25071 567.994292z" fill="#07C160" />
            </svg>
          );
        case 'qq':
          return (
            <svg viewBox="0 0 1024 1024" className={iconClass} version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" fill="#12B7F5" />
            </svg>
          );
        default:
          return (
            <svg viewBox="0 0 1024 1024" className={iconClass} version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path d="M511.670857 128c171.995429 0 311.917714 141.677714 311.917714 315.794286 0 78.994286-30.061714 155.428571-82.651428 213.357714 52.004571 20.553143 102.692571 41.472 120.027428 48.713143 10.166857 4.205714 16.822857 14.262857 16.749715 25.380571v137.289143c0 15.177143-12.105143 27.465143-27.136 27.465143H445.44c-112.859429 0-253.44-148.443429-289.609143-244.662857-19.602286-52.297143-5.266286-79.872 10.203429-93.769143a63.305143 63.305143 0 0 1 42.642285-16.969143c41.764571 0 80.164571 41.325714 120.795429 85.028572 28.562286 30.72 60.928 65.536 87.405714 75.885714a456.045714 456.045714 0 0 0 163.401143 30.464c-16.310857-20.918857-30.061714-40.009143-33.682286-49.152-5.924571-14.994286-3.328-33.024 6.838858-48.274286 12.251429-18.285714 32.402286-28.16 53.504-24.832 12.214857 1.901714 43.154286 12.653714 79.433142 26.331429 0.621714-0.658286 0.914286-1.536 1.536-2.194286a259.474286 259.474286 0 0 0 81.481143-190.061714c0-143.835429-115.602286-260.864-257.682285-260.864-142.043429 0-257.609143 117.028571-257.609143 260.864 0 11.556571 0.731429 23.003429 2.194285 34.011428a27.428571 27.428571 0 0 1-23.405714 30.829715 27.428571 27.428571 0 0 1-30.427428-23.661715 321.609143 321.609143 0 0 1-2.596572-41.179428c0-174.116571 139.885714-315.794286 311.844572-315.794286zM408.539429 329.142857c11.300571 0.146286 22.491429 0 33.792 0.146286 23.552 0.146286 46.921143 0.146286 70.363428 0.146286h101.449143c6.838857 0 7.899429 1.645714 7.497143 11.373714-0.658286 13.714286-6.144 20.955429-16.091429 20.955428h-61.805714c-7.497143 0-7.789714 1.024-8.009143 11.227429-0.438857 17.078857 0 17.554286 8.301714 17.444571h55.003429c11.483429 0 16.896 7.936 16.786286 24.137143-0.109714 34.413714-0.109714 32.402286 0 66.779429 0.109714 23.478857-12.141714 41.325714-28.964572 41.764571h-13.165714c-3.84 0.146286-5.412571-1.901714-5.412571-7.387428 0.219429-40.265143 0.109714-44.141714 0.292571-84.443429 0-6.509714-1.792-8.850286-6.217143-8.704-6.875429 0.146286-13.750857 0.292571-20.589714 0-4.461714-0.146286-6.363429 2.194286-6.363429 8.557714l0.219429 103.314286c0 28.781714-11.812571 45.348571-32.329143 45.458286h-10.020571c-3.401143 0-5.302857-2.048-5.302858-7.094857 0.109714-46.445714 0.109714-92.964571 0.329143-139.446857 0-9.618286-0.548571-10.788571-7.204571-10.788572s-13.421714 0-20.077714-0.146286c-4.022857-0.146286-5.705143 2.340571-5.595429 7.972572 0.219429 28.489143 0.219429 20.553143 0.329143 49.005714 0 26.733714-11.702857 43.410286-30.866286 43.556572-3.913143 0-7.68-0.146286-11.593143 0-3.730286 0.146286-5.412571-1.901714-5.412571-7.387429 0.109714-46.774857 0-56.832 0.109714-103.643429 0-13.129143 6.144-21.540571 15.652572-21.686857 19.017143-0.146286 38.034286 0 57.051428 0 7.168 0 7.826286-0.877714 7.497143-11.081143 0-0.731429 0-1.462857-0.109714-2.194285-0.182857-14.226286-0.219429-15.396571-9.069715-15.506286h-59.721142c-11.300571 0-16.822857-7.826286-17.005715-23.478857-0.109714-6.326857 1.682286-8.996571 6.217143-8.850286z" fill="#515151" />
            </svg>
          );
      }
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
      <TooltipProvider>
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
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-base">
                <thead className="bg-white/50 border-b border-gray-100/50">
                  <tr>
                    <th className="px-8 py-5 text-left font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">投喂者</th>
                    {merge ? (
                      <>
                        <th className="px-8 py-5 text-center font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">投喂次数</th>
                        <th className="px-8 py-5 text-right font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">总金额</th>
                        <th className="px-8 py-5 text-left font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">最近时间</th>
                      </>
                    ) : (
                      <>
                        <th className="px-8 py-5 text-center font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">支付方式</th>
                        <th className="px-8 py-5 text-right font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">金额</th>
                        <th className="px-8 py-5 text-left font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">留言</th>
                        <th className="px-8 py-5 text-center font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">状态</th>
                        <th className="px-8 py-5 text-left font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">时间</th>
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
                        <td colSpan={merge ? 5 : 6} className="px-8 py-16 text-center text-gray-400 font-medium">
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
                            const path = merge ? `/list/${donation.id}` : `/donation/${donation.id}`;
                            router.push(path);
                          }}
                        >
                          <td className="px-8 py-5 whitespace-nowrap">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-3">
                                  <img src={getUserAvatarUrl(donation.user_email, 40)} alt="avatar" className="w-8 h-8 rounded-full shrink-0" />
                                  <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {donation.user_name}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{maskContact(donation.user_email)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </td>

                          {merge ? (
                            <>
                              <td className="px-8 py-5 text-center text-gray-600 font-medium whitespace-nowrap">
                                {donation.donation_count}
                              </td>
                              <td className="px-8 py-5 text-right font-bold text-gray-900 whitespace-nowrap">
                                ¥{formatAmount(donation.amount)}
                              </td>
                              <td className="px-8 py-5 text-gray-400 text-sm font-medium">
                                <div className="flex flex-col">
                                  <span>{formatDateTime(donation.created_at).date}</span>
                                  <span>{formatDateTime(donation.created_at).time}</span>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-8 py-5">
                                <div className="flex items-center justify-center">
                                  <PaymentIcon method={donation.payment_method} />
                                </div>
                              </td>
                              <td className="px-8 py-5 text-right font-bold text-gray-900 whitespace-nowrap">
                                ¥{formatAmount(donation.amount)}
                              </td>
                              <td className="px-8 py-5 text-gray-600 text-sm">
                                <div className="max-w-[360px] break-words whitespace-normal">
                                  {donation.user_message || '-'}
                                  {donation.reply_content && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 cursor-help ml-2 align-middle" title="已回复">
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{donation.reply_content}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </td>
                              <td className="px-8 py-5 whitespace-nowrap">
                                <div className="flex items-center justify-center">
                                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${STATUS_BADGE_STYLES[donation.status as keyof typeof STATUS_BADGE_STYLES] || STATUS_BADGE_STYLES.pending
                                    }`}>
                                    {STATUS_LABELS[donation.status as keyof typeof STATUS_LABELS] || donation.status}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-gray-400 text-sm font-medium">
                                <div className="flex flex-col">
                                  <span>{formatDateTime(donation.created_at).date}</span>
                                  <span>{formatDateTime(donation.created_at).time}</span>
                                </div>
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

            {/* Mobile View: Cards */}
            <div className="md:hidden">
              <AnimatePresence mode="popLayout">
                {filteredDonations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center text-gray-400 font-medium"
                  >
                    还没有投喂记录，欢迎成为第一位支持者！
                  </motion.div>
                ) : (
                  <div className="divide-y divide-gray-100/50">
                    {visibleDonations.map((donation, index) => (
                      <motion.div
                        key={donation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 hover:bg-white/60 transition-all duration-200 active:bg-white/80"
                        onClick={() => {
                          const path = merge ? `/list/${donation.id}` : `/donation/${donation.id}`;
                          router.push(path);
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img src={getUserAvatarUrl(donation.user_email, 40)} alt="avatar" className="w-10 h-10 rounded-full shrink-0 border border-white shadow-sm" />
                            <div>
                              <div className="font-bold text-gray-900">{donation.user_name}</div>
                              <div className="text-xs text-gray-500">{formatDateTime(donation.created_at).date} {formatDateTime(donation.created_at).time}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-gray-900">¥{formatAmount(donation.amount)}</div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGE_STYLES[donation.status as keyof typeof STATUS_BADGE_STYLES] || STATUS_BADGE_STYLES.pending
                              }`}>
                              {STATUS_LABELS[donation.status as keyof typeof STATUS_LABELS] || donation.status}
                            </span>
                          </div>
                        </div>

                        {!merge && (
                          <div className="pl-[52px]">
                            {donation.user_message && (
                              <div className="text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg mb-2">
                                "{donation.user_message}"
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span className={cn("font-medium", PAYMENT_METHOD_COLORS[donation.payment_method as keyof typeof PAYMENT_METHOD_COLORS])}>
                                {PAYMENT_METHOD_LABELS[donation.payment_method as keyof typeof PAYMENT_METHOD_LABELS]}
                              </span>
                              {donation.reply_content && (
                                <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>
                                  已回复
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }
);

DonationList.displayName = 'DonationList';

export default DonationList;
