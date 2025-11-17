import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '捐赠分析',
  description: '查看捐赠统计和分析',
};

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          返回主页
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">数据分析仪表板</h1>
          <p className="text-gray-600">全面的捐赠统计和洞察</p>
        </div>

        <AnalyticsDashboard />
      </div>
    </main>
  );
}
