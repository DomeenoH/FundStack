'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
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
  Legend
} from 'recharts';

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
  trends: {
    daily: Array<{ date: string; count: number; amount: number }>;
    weekly: Array<{ date: string; count: number; amount: number }>;
    monthly: Array<{ date: string; count: number; amount: number }>;
  };
  top_donors: Array<{ name: string; amount: number; date: string }>;
}

// 支付方式主题色配置
const PAYMENT_COLORS: Record<string, string> = {
  'wechat': '#09BB07',      // 微信绿
  '微信支付': '#09BB07',
  'alipay': '#1677FF',      // 支付宝蓝
  '支付宝': '#1677FF',
  'qq': '#12B7F5',          // QQ蓝
  'QQ支付': '#12B7F5',
  'other': '#8B8B8B',       // 灰色
  '其他': '#8B8B8B',
};

// 支付方式中文名称映射
const PAYMENT_LABELS: Record<string, string> = {
  'wechat': '微信支付',
  'alipay': '支付宝',
  'qq': 'QQ支付',
  'other': '其他',
};

// 获取支付方式颜色
const getPaymentColor = (method: string): string => {
  return PAYMENT_COLORS[method] || PAYMENT_COLORS[method.toLowerCase()] || '#8884d8';
};

// 获取支付方式中文名称
const getPaymentLabel = (method: string): string => {
  return PAYMENT_LABELS[method] || PAYMENT_LABELS[method.toLowerCase()] || method;
};

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState('daily');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error('[投喂小站] Failed to fetch analytics:', error);
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

  // 处理支付数据，添加中文标签和颜色
  const paymentData = Object.entries(analytics.payment_methods).map(([name, data]) => ({
    name: getPaymentLabel(name),
    value: data.amount,
    count: data.count,
    color: getPaymentColor(name)
  }));

  // 计算总数用于百分比显示
  const totalAmount = paymentData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">投喂小伙伴</p>
                <p className="text-3xl font-bold text-blue-900">{analytics.summary.total_donors}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500 opacity-30" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">已提交金额</p>
                <p className="text-3xl font-bold text-green-900">¥{analytics.summary.total_amount.toFixed(2)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-30" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">已确认</p>
                <p className="text-3xl font-bold text-purple-900">¥{analytics.summary.confirmed_amount.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500 opacity-30" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">平均投喂</p>
                <p className="text-3xl font-bold text-orange-900">¥{analytics.summary.average_donation.toFixed(2)}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500 opacity-30" />
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">投喂趋势</h3>
              <Tabs value={trendPeriod} onValueChange={setTrendPeriod}>
                <TabsList>
                  <TabsTrigger value="daily">日</TabsTrigger>
                  <TabsTrigger value="weekly">周</TabsTrigger>
                  <TabsTrigger value="monthly">月</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.trends[trendPeriod as keyof typeof analytics.trends]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#8884d8"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `¥${value}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#82ca9d"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'amount' ? `¥${value.toFixed(2)}` : value,
                      name === 'amount' ? '金额' : '笔数'
                    ]}
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="amount"
                    name="金额"
                    stroke="#8884d8"
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    name="笔数"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    dot={{ fill: '#82ca9d', r: 4 }}
                    activeDot={{ r: 6 }}
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
          <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold mb-4">支付方式占比</h3>
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
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
                    formatter={(value: number, name: string, props: any) => [
                      `¥${value.toFixed(2)} (${((value / totalAmount) * 100).toFixed(1)}%)`,
                      `${props.payload.count} 笔`
                    ]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {paymentData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-gray-600">{item.count} 笔</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-bold mb-4">投喂榜单</h3>
          <div className="space-y-3">
            {analytics.top_donors.length > 0 ? (
              analytics.top_donors.map((donor, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-3 hover:bg-gray-50 rounded px-2 -mx-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                        idx === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-orange-900' :
                          'bg-gray-100 text-gray-600'
                      }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium">{donor.name}</p>
                      <p className="text-xs text-gray-500">
                        最近: {new Date(donor.date).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-blue-600">¥{donor.amount.toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">还没有上榜的小伙伴</p>
            )}
          </div>
        </Card>

        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-bold mb-4">最近趋势</h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-700 mb-2">过去7天</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-blue-900">
                  {analytics.recent_trends.last_7_days.count}
                </p>
                <p className="text-sm text-blue-600 mb-2 font-medium">笔投喂</p>
              </div>
              <p className="text-sm text-blue-800 mt-3 font-semibold">
                共计 ¥{analytics.recent_trends.last_7_days.total.toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(analytics.payment_methods).map(([method, data]) => (
                <div
                  key={method}
                  className="border-2 rounded-lg p-3 hover:shadow-md transition-shadow"
                  style={{ borderColor: getPaymentColor(method) + '40' }}
                >
                  <p className="text-xs font-medium mb-1" style={{ color: getPaymentColor(method) }}>
                    {getPaymentLabel(method)}
                  </p>
                  <p className="font-bold text-lg">¥{data.amount.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 mt-1">{data.count} 笔</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
