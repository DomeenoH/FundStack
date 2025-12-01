
'use client';

import Image from 'next/image';
import { Sparkles, WalletCards, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { SiteConfig } from '@/lib/config-shared';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { getCreatorAvatarUrl } from '@/lib/avatar-utils';

interface CreatorCardProps {
  config: SiteConfig;
  selectedPaymentMethod?: string;
}

export function CreatorCard({ config, selectedPaymentMethod }: CreatorCardProps) {
  const [copied, setCopied] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Default to wechat if none selected, but we only show QR if explicitly selected or if we decide to show a default
  const activeMethod = selectedPaymentMethod || 'wechat';

  // Get creator avatar with QQ fallback
  const creatorAvatarUrl = avatarError
    ? '/placeholder-user.jpg'
    : getCreatorAvatarUrl(
      config.creator_avatar,
      config.creator_qq_number || config.payment_qq_number
    );

  // Use payment QQ number if set, otherwise fallback to creator QQ number
  const qqNumber = config.payment_qq_number || config.creator_qq_number;

  const handleCopyQQ = () => {
    if (qqNumber) {
      navigator.clipboard.writeText(qqNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      layout
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
          <div className="absolute inset-0 rounded-full bg-gray-100/50 blur-2xl opacity-50" />
          <Image
            src={creatorAvatarUrl}
            alt="Avatar"
            width={120}
            height={120}
            className="relative h-28 w-28 rounded-full object-cover shadow-lg border-4 border-white"
            priority
            onError={() => setAvatarError(true)}
          />
          {/* Avatar Badge */}
          {(config.creator_avatar_badge || config.creator_avatar_badge_content) && (
            <div
              className="absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10 overflow-hidden"
              style={{
                backgroundColor: config.creator_avatar_badge_bg_visible !== false
                  ? (config.creator_avatar_badge_bg_color || '#3b82f6')
                  : 'transparent',
              }}
            >
              {config.creator_avatar_badge_type === 'image' && config.creator_avatar_badge_content ? (
                <img
                  src={config.creator_avatar_badge_content}
                  alt="Badge"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm leading-none select-none">
                  {config.creator_avatar_badge_content || config.creator_avatar_badge}
                </span>
              )}
            </div>
          )}
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
              key={`qr-${activeMethod}`}
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

          {/* Case 2: QQ Payment (Show QQ Avatar) */}
          {activeMethod === 'qq' && (
            <motion.div
              key="qq-avatar"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center w-full"
            >
              <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-gray-200/60">
                <Image
                  src={`https://q.qlogo.cn/headimg_dl?dst_uin=${qqNumber}&spec=640&img_type=jpg`}
                  alt="QQ Avatar"
                  width={200}
                  height={200}
                  className="rounded-xl"
                />
              </div>
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  QQ 支付
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-lg font-mono font-bold text-gray-900">
                    {qqNumber || '未设置'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyQQ}
                    className="h-7 w-7 p-0"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
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
