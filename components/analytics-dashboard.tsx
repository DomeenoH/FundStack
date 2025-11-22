'use client';

import { useEffect, useState } from 'react';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

  const paymentData = Object.entries(analytics.payment_methods).map(([name, data]) => ({
    name,
    value: data.amount
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">投喂小伙伴</p>
              <p className="text-3xl font-bold">{analytics.summary.total_donors}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已提交金额</p>
              <p className="text-3xl font-bold">¥{analytics.summary.total_amount.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已确认</p>
              <p className="text-3xl font-bold">¥{analytics.summary.confirmed_amount.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均投喂</p>
              <p className="text-3xl font-bold">¥{analytics.summary.average_donation.toFixed(2)}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500 opacity-20" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#8884d8"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `¥${value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#82ca9d"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'amount' ? `¥${value.toFixed(2)}` : value,
                    name === 'amount' ? '金额' : '笔数'
                  ]}
                  labelStyle={{ color: '#333' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="amount" name="金额" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="count" name="笔数" stroke="#82ca9d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">支付方式占比</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">投喂榜单</h3>
          <div className="space-y-2">
            {analytics.top_donors.length > 0 ? (
              analytics.top_donors.map((donor, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-700' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'
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
                  <p className="font-bold text-lg">¥{donor.amount.toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">还没有上榜的小伙伴</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">最近趋势</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">过去7天</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-blue-900">
                  {analytics.recent_trends.last_7_days.count}
                </p>
                <p className="text-sm text-blue-600 mb-1">笔投喂</p>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                共计 ¥{analytics.recent_trends.last_7_days.total.toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(analytics.payment_methods).map(([method, data]) => (
                <div key={method} className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500 capitalize mb-1">{method}</p>
                  <p className="font-bold">¥{data.amount.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">{data.count} 笔</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
