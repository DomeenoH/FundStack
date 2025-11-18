import DonationList from '@/components/donation-list';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '投喂墙',
  description: '看看大家的投喂记录',
};

export default function ListPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          返回投喂小站
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">投喂墙</h1>
          <p className="text-gray-600">这里记录着每一份温柔的支持</p>
        </div>

        <DonationList />
      </div>
    </main>
  );
}
