import DonationForm from '@/components/donation-form';
import DonationList from '@/components/donation-list';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export const metadata = {
  title: '支持我们 - 捐赠平台',
  description: '用捐赠支持我们的工作。快速、安全、简单。',
};

export default function DonationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">支持我们的使命</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            你的慷慨捐赠帮助我们继续创作优质内容和维护我们的服务。感谢你成为我们社区的一部分！
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          <div>
            <DonationForm />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">为什么要捐赠？</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>支持优质内容创作</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>帮助我们维护服务器</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>推动新功能和改进</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>加入我们的支持者社区</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-lg mb-3">安全且私密</h3>
              <p className="text-sm text-gray-700">
                您的支付信息经过安全处理。我们从不存储敏感的支付数据，只收集捐赠追踪所需的必要信息。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">最近捐赠</h2>
          <DonationList />
        </div>
      </div>
    </main>
  );
}
