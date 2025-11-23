'use client';

import Image from 'next/image';
import { Sparkles, WalletCards } from 'lucide-react';
import type { SiteConfig } from '@/lib/config';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CreatorCardProps {
  config: SiteConfig;
  selectedPaymentMethod?: string;
}

export function CreatorCard({ config, selectedPaymentMethod }: CreatorCardProps) {
  // Default to wechat if none selected, but we only show QR if explicitly selected or if we decide to show a default
  // For Apple style, let's keep it clean: if no selection, show profile/reasons. If selection, show QR.
  const activeMethod = selectedPaymentMethod || 'wechat';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 h-full flex flex-col"
    >
      {/* Header / Profile Section */}
      <div className="p-8 pb-6 flex flex-col items-center text-center z-10 relative">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-200 to-transparent blur-2xl opacity-50" />
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

      {/* Dynamic Content Section (QR Code or Placeholder) */}
      <div className="flex-1 bg-gray-50/50 border-t border-gray-100/50 p-8 flex flex-col justify-center items-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedPaymentMethod ? (
            <motion.div
              key="qr-code"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center w-full"
            >
              <div className="relative group">
                <div className={cn(
                  "absolute -inset-4 rounded-2xl opacity-20 blur-xl transition-colors duration-500",
                  activeMethod === 'alipay' ? "bg-blue-500" : "bg-green-500"
                )} />
                <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <Image
                    src={activeMethod === 'alipay' ? config.payment_alipay_qr : config.payment_wechat_qr}
                    alt="Payment QR"
                    width={200}
                    height={200}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-gray-500">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  activeMethod === 'alipay' ? "bg-blue-500" : "bg-green-500"
                )} />
                {activeMethod === 'alipay' ? '支付宝' : '微信'}支付
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-gray-400 gap-3"
            >
              <WalletCards className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium text-gray-400">选择左侧方式支持</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
