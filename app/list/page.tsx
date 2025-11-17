import DonationList from '@/components/donation-list';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '捐赠列表',
  description: '查看所有已确认的捐赠',
};

export default function ListPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          返回捐赠
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">捐赠列表</h1>
          <p className="text-gray-600">查看来自我们出色支持者的所有已确认捐赠</p>
        </div>

        <DonationList />
      </div>
    </main>
  );
}
