'use client';

import Image from 'next/image';
import { Sparkles, WalletCards, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import type { SiteConfig } from '@/lib/config';

interface CreatorCardProps {
  config: SiteConfig;
}

export function CreatorCard({ config }: CreatorCardProps) {
  const [showPayments, setShowPayments] = useState(false);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm flex gap-4 items-start">
      <Image
        src={config.creator_avatar}
        alt="站长头像"
        width={80}
        height={80}
        className="h-20 w-20 rounded-full object-cover shadow"
      />
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-500" />
            {config.creator_role}
          </p>
          <h3 className="text-xl font-semibold">{config.creator_name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {config.creator_description}
          </p>
        </div>
        <div className="space-y-3">
          <Button
            type="button"
            className="inline-flex items-center gap-2"
            onClick={() => setShowPayments(prev => !prev)}
          >
            {showPayments ? <X className="h-4 w-4" /> : <WalletCards className="h-4 w-4" />}
            {showPayments ? config.payment_methods_button_text_close : config.payment_methods_button_text}
          </Button>
          {showPayments && (
            <div className="space-y-3 rounded-md border bg-slate-50 p-3 text-sm text-gray-700">
              <p className="font-medium">{config.payment_methods_description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-2 rounded-md bg-white p-3 shadow-sm">
                  <Image src={config.payment_alipay_qr} alt="支付宝收款码" width={96} height={96} />
                  <span className="text-xs text-gray-600">支付宝 / 二维码示意</span>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-md bg-white p-3 shadow-sm">
                  <Image src={config.payment_wechat_qr} alt="微信收款码" width={96} height={96} />
                  <span className="text-xs text-gray-600">微信 / 二维码示意</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
