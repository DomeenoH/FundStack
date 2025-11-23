'use client';

import Image from 'next/image';
import { Sparkles, WalletCards, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import type { SiteConfig } from '@/lib/config';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CreatorCardProps {
  config: SiteConfig;
  selectedPaymentMethod?: string;
}

export function CreatorCard({ config, selectedPaymentMethod }: CreatorCardProps) {
  // If selectedPaymentMethod is provided, we automatically show payments
  // Otherwise we keep the internal toggle state
  const [showPaymentsInternal, setShowPaymentsInternal] = useState(false);

  const showPayments = selectedPaymentMethod ? true : showPaymentsInternal;

  // Determine which QR code to show based on selection
  // Default to both or a specific one if no selection passed (fallback behavior)
  const activeMethod = selectedPaymentMethod || 'wechat'; // Default to wechat if none selected

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-md"
    >
      <div className="flex gap-5 items-start relative z-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500 blur-sm opacity-50" />
          <Image
            src={config.creator_avatar}
            alt="站长头像"
            width={88}
            height={88}
            className="relative h-22 w-22 rounded-full object-cover border-2 border-white shadow-md"
          />
        </motion.div>

        <div className="flex-1 space-y-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-600 border border-pink-100">
                <Sparkles className="h-3 w-3" />
                {config.creator_role}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{config.creator_name}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              {config.creator_description}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showPayments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mt-6 pt-6 border-t border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <WalletCards className="w-4 h-4 text-violet-500" />
                <span>投喂通道</span>
              </h4>
              {selectedPaymentMethod && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  已选择: {config.payment_methods.find(m => m.value === selectedPaymentMethod)?.label}
                </span>
              )}
            </div>

            <div className="bg-white/60 rounded-xl p-4 border border-white/50 shadow-inner">
              <div className="flex justify-center items-center">
                <AnimatePresence mode="wait">
                  {activeMethod === 'alipay' && (
                    <motion.div
                      key="alipay"
                      initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.9, rotate: 5 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                        <Image src={config.payment_alipay_qr} alt="支付宝收款码" width={180} height={180} className="rounded-lg" />
                      </div>
                      <p className="text-sm font-medium text-blue-600 flex items-center gap-1">
                        <Image src="/alipay.svg" width={16} height={16} alt="Alipay" className="w-4 h-4" onError={(e) => e.currentTarget.style.display = 'none'} />
                        支付宝扫码
                      </p>
                    </motion.div>
                  )}

                  {activeMethod === 'wechat' && (
                    <motion.div
                      key="wechat"
                      initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.9, rotate: -5 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-green-100">
                        <Image src={config.payment_wechat_qr} alt="微信收款码" width={180} height={180} className="rounded-lg" />
                      </div>
                      <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                        <Image src="/wechat.svg" width={16} height={16} alt="WeChat" className="w-4 h-4" onError={(e) => e.currentTarget.style.display = 'none'} />
                        微信扫码
                      </p>
                    </motion.div>
                  )}

                  {/* Fallback for other methods or if we want to show both side by side when no specific selection (though current logic defaults to wechat) */}
                </AnimatePresence>
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">
                {config.payment_methods_description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decorative elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-400/10 rounded-full blur-3xl" />
    </motion.div>
  );
}
