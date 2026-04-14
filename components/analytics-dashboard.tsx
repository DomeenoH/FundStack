'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

type TrendPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
type AnalyticsRangeKey = '7d' | '30d' | '90d' | '1y' | 'all';

interface Analytics {
  range: {
    key: AnalyticsRangeKey;
    label: string;
  };
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
    selected_range: { label: string; count: number; total: number };
  };
  trends: {
    daily: Array<{ date: string; count: number; amount: number }>;
    weekly: Array<{ date: string; count: number; amount: number }>;
    monthly: Array<{ date: string; count: number; amount: number }>;
    yearly: Array<{ date: string; count: number; amount: number }>;
  };
  top_donors: Array<{ name: string; amount: number; date: string }>;
}

const RANGE_OPTIONS: Array<{ value: AnalyticsRangeKey; label: string }> = [
  { value: '7d', label: '近7天' },
  { value: '30d', label: '近30天' },
  { value: '90d', label: '近90天' },
  { value: '1y', label: '近1年' },
  { value: 'all', label: '全部时间' },
];

const PAYMENT_COLORS: Record<string, string> = {
  wechat: '#09BB07',
  微信支付: '#09BB07',
  alipay: '#1677FF',
  支付宝: '#1677FF',
  qq: '#12B7F5',
  QQ支付: '#12B7F5',
  other: '#8B8B8B',
  其他: '#8B8B8B',
};

const PAYMENT_LABELS: Record<string, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
  qq: 'QQ支付',
  other: '其他',
};

const getPaymentColor = (method: string): string =>
  PAYMENT_COLORS[method] || PAYMENT_COLORS[method.toLowerCase()] || '#8884d8';

const getPaymentLabel = (method: string): string =>
  PAYMENT_LABELS[method] || PAYMENT_LABELS[method.toLowerCase()] || method;

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('daily');
  const [selectedRange, setSelectedRange] = useState<AnalyticsRangeKey>('all');

  useEffect(() => {
    let active = true;

    const fetchAnalytics = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/analytics?range=${selectedRange}`);
        if (!response.ok) {
          throw new Error(`analytics fetch failed: ${response.status}`);
        }

        const data = await response.json();
        if (active) {
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error('[投喂小站] Failed to fetch analytics:', error);
        if (active) {
          setAnalytics(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      active = false;
    };
  }, [selectedRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-8 text-center text-gray-500 shadow-sm">
        暂时没能加载投喂分析数据
      </Card>
    );
  }

  const paymentData = Object.entries(analytics.payment_methods).map(([name, data]) => ({
    name: getPaymentLabel(name),
    value: data.amount,
    count: data.count,
    color: getPaymentColor(name),
  }));

  const totalAmount = paymentData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">统计范围</p>
            <p className="text-sm text-slate-500">
              汇总卡片、支付方式、榜单和趋势图都会按这个范围一起刷新
            </p>
          </div>
          <Tabs
            value={selectedRange}
            onValueChange={(value) => setSelectedRange(value as AnalyticsRangeKey)}
          >
            <TabsList className="h-auto flex-wrap justify-start gap-2 bg-slate-100/80 p-1">
              {RANGE_OPTIONS.map((option) => (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className="rounded-full px-3 py-1.5 text-sm"
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">投喂小伙伴</p>
                <p className="text-xs text-blue-500">{analytics.range.label}</p>
                <p className="text-3xl font-bold text-blue-900">{analytics.summary.total_donors}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-30" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">已提交金额</p>
                <p className="text-xs text-green-500">{analytics.range.label}</p>
                <p className="text-3xl font-bold text-green-900">
                  ¥{analytics.summary.total_amount.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500 opacity-30" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">已确认</p>
                <p className="text-xs text-purple-500">{analytics.range.label}</p>
                <p className="text-3xl font-bold text-purple-900">
                  ¥{analytics.summary.confirmed_amount.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500 opacity-30" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">平均投喂</p>
                <p className="text-xs text-orange-500">{analytics.range.label}</p>
                <p className="text-3xl font-bold text-orange-900">
                  ¥{analytics.summary.average_donation.toFixed(2)}
                </p>
              </div>
              <Clock className="h-10 w-10 text-orange-500 opacity-30" />
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-bold">投喂趋势</h3>
                <p className="text-sm text-gray-500">当前范围：{analytics.range.label}</p>
              </div>
              <Tabs value={trendPeriod} onValueChange={(value) => setTrendPeriod(value as TrendPeriod)}>
                <TabsList>
                  <TabsTrigger value="daily">日</TabsTrigger>
                  <TabsTrigger value="weekly">周</TabsTrigger>
                  <TabsTrigger value="monthly">月</TabsTrigger>
                  <TabsTrigger value="yearly">年</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.trends[trendPeriod]}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    orientation="left"
                    stroke="#8884d8"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => `¥${value}`}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    axisLine={false}
                    orientation="right"
                    stroke="#82ca9d"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number, name: string) => [
                      name === '金额' ? `¥${value.toFixed(2)}` : value,
                      name,
                    ]}
                    labelStyle={{ color: '#333' }}
                  />
                  <Legend iconType="line" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line
                    activeDot={{ r: 6 }}
                    dataKey="amount"
                    dot={{ fill: '#8884d8', r: 4 }}
                    name="金额"
                    stroke="#8884d8"
                    strokeWidth={3}
                    type="monotone"
                    yAxisId="left"
                  />
                  <Line
                    activeDot={{ r: 6 }}
                    dataKey="count"
                    dot={{ fill: '#82ca9d', r: 4 }}
                    name="笔数"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    type="monotone"
                    yAxisId="right"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="flex h-full flex-col p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="mb-4">
              <h3 className="text-xl font-bold">支付方式占比</h3>
              <p className="text-sm text-gray-500">当前范围内的已确认投喂</p>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={paymentData}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {paymentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      formatter={(value: number, _name: string, item: any) => {
                        const count = item?.payload?.count ?? 0;
                        const percent =
                          totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : '0.0';
                        return [`¥${value.toFixed(2)} (${percent}%)`, `${count} 笔`];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-3 px-2">
                {paymentData.length > 0 ? (
                  paymentData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-gray-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-gray-900">¥{item.value.toFixed(0)}</span>
                        <span className="text-xs text-gray-500">{item.count} 笔</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">当前范围内还没有已确认的投喂</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
          <div className="mb-4">
            <h3 className="text-xl font-bold">投喂榜单</h3>
            <p className="text-sm text-gray-500">按当前范围内的已确认金额排序</p>
          </div>
          <div className="space-y-3">
            {analytics.top_donors.filter((donor) => donor.name !== '-').length > 0 ? (
              analytics.top_donors
                .filter((donor) => donor.name !== '-')
                .map((donor, idx) => (
                  <div
                    key={idx}
                    className="mx-[-0.5rem] flex items-center justify-between rounded border-b px-2 pb-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          idx === 0
                            ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900'
                            : idx === 1
                              ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800'
                              : idx === 2
                                ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-orange-900'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium">{donor.name}</p>
                        <p className="text-xs text-gray-500">
                          最近: {new Date(donor.date).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-blue-600">¥{donor.amount.toFixed(2)}</p>
                  </div>
                ))
            ) : (
              <p className="py-4 text-center text-gray-500">当前范围内还没有上榜的小伙伴</p>
            )}
          </div>
        </Card>

        <Card className="p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
          <div className="mb-4">
            <h3 className="text-xl font-bold">范围摘要</h3>
            <p className="text-sm text-gray-500">这里展示当前所选范围内的已确认投喂</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5">
              <p className="mb-2 text-sm font-medium text-blue-700">
                {analytics.recent_trends.selected_range.label}
              </p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-blue-900">
                  {analytics.recent_trends.selected_range.count}
                </p>
                <p className="mb-2 text-sm font-medium text-blue-600">笔投喂</p>
              </div>
              <p className="mt-3 text-sm font-semibold text-blue-800">
                共计 ¥{analytics.recent_trends.selected_range.total.toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(analytics.payment_methods).map(([method, data]) => (
                <div
                  key={method}
                  className="rounded-lg border-2 p-3 transition-shadow hover:shadow-md"
                  style={{ borderColor: `${getPaymentColor(method)}40` }}
                >
                  <p className="mb-1 text-xs font-medium" style={{ color: getPaymentColor(method) }}>
                    {getPaymentLabel(method)}
                  </p>
                  <p className="text-lg font-bold">¥{data.amount.toFixed(0)}</p>
                  <p className="mt-1 text-xs text-gray-500">{data.count} 笔</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
