import DonationForm from '@/components/donation-form';
import DonationList from '@/components/donation-list';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { CreatorCard } from '@/components/creator-card';

export const metadata = {
  title: '温暖投喂小站',
  description: '用一份贴心的投喂陪伴创作，快速、安全又安心。',
};

export default function DonationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">来一份暖心的投喂吧</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            你的支持是我们继续创作的能量，谢谢每一位一路相伴的守护者！
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          <div>
            <DonationForm />
          </div>
          <div className="space-y-6">
            <CreatorCard />
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">为什么要投喂？</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>和我们一起养肥内容创作</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>帮助我们守护小站的服务器</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>催生更多有趣的新功能</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>加入投喂伙伴的行列</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-lg mb-3">安全且贴心</h3>
              <p className="text-sm text-gray-700">
                你的支付信息会被安全处理，敏感数据绝不存储，只会记录必要的投喂信息用于确认。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">最新投喂（取最近 5 位）</h2>
          <DonationList limit={5} merge={false} />
        </div>
      </div>
    </main>
  );
}
