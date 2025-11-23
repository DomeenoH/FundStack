
'use client';

import Image from 'next/image';
import { Sparkles, WalletCards, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { SiteConfig } from '@/lib/config';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface CreatorCardProps {
  config: SiteConfig;
  selectedPaymentMethod?: string;
}

export function CreatorCard({ config, selectedPaymentMethod }: CreatorCardProps) {
  const [copied, setCopied] = useState(false);

  // Default to wechat if none selected, but we only show QR if explicitly selected or if we decide to show a default
  const activeMethod = selectedPaymentMethod || 'wechat';

  const handleCopyQQ = () => {
    if (config.payment_qq_number) {
      navigator.clipboard.writeText(config.payment_qq_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 h-full flex flex-col"
    >
      {/* Header / Profile Section */}
      <div className="p-8 pb-6 flex flex-col items-center text-center z-10 relative">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 rounded-full bg-gray-100/50 blur-2xl opacity-50" />
          <Image
            src={config.creator_avatar}
            alt="Avatar"
            width={120}
            height={120}
            className="relative h-28 w-28 rounded-full object-cover shadow-lg border-4 border-white"
            priority
          />
          <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
            <Sparkles className="w-3 h-3" />
          </div>
        </motion.div>

        <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">{config.creator_name}</h3>
        <p className="text-sm text-gray-500 font-medium tracking-wide uppercase opacity-80 mb-4">
          {config.creator_role}
        </p>
        <p className="text-base text-gray-600 leading-relaxed max-w-xs mx-auto">
          {config.creator_description}
        </p>
      </div>

      {/* Dynamic Content Section */}
      <div className="flex-1 bg-gray-50/80 border-t border-gray-100 p-8 flex flex-col justify-center items-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Case 1: QR Code Methods (Alipay / WeChat) */}
          {(activeMethod === 'alipay' || activeMethod === 'wechat') && (
            <motion.div
              key="qr-code"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center w-full"
            >
              <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-gray-200/60">
                <Image
                  src={activeMethod === 'alipay' ? config.payment_alipay_qr : config.payment_wechat_qr}
                  alt="Payment QR"
                  width={200}
                  height={200}
                  className="rounded-xl"
                />
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-gray-500">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  activeMethod === 'alipay' ? "bg-blue-500" : "bg-green-500"
                )} />
                {activeMethod === 'alipay' ? '支付宝' : '微信'}扫码支付
              </div>
            </motion.div>
          )}

          {/* Case 2: QQ Payment (Show Number) */}
          {activeMethod === 'qq' && (
            <motion.div
              key="qq-number"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center justify-center w-full text-center"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
                {/* QQ Icon Placeholder or SVG */}
                <span className="font-bold text-xl">QQ</span>
              </div>
              <h4 className="text-gray-500 text-sm font-medium mb-2">QQ 账号</h4>
              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm mb-4">
                <span className="text-xl font-mono font-bold text-gray-900 tracking-wide">
                  {config.payment_qq_number || '未设置'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyQQ}
                className="rounded-full px-6 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-2 text-green-500" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-2" />
                    复制账号
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Case 3: Other / Default (Thank You Message) */}
          {(activeMethod === 'other' || !selectedPaymentMethod) && (
            <motion.div
              key="message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center max-w-xs"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <WalletCards className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="text-gray-900 font-semibold mb-2">感谢你的支持</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                {activeMethod === 'other'
                  ? "请通过其他方式联系站长进行投喂，每一份心意都值得被铭记。"
                  : "选择左侧支付方式，开启投喂之旅。"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
