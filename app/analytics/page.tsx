import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Donation Analytics',
  description: 'View donation statistics and analytics',
};

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive donation statistics and insights</p>
        </div>

        <AnalyticsDashboard />
      </div>
    </main>
  );
}
