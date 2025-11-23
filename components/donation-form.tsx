'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, WalletCards, Check } from 'lucide-react';
import { ApiError, fetchJson } from '@/lib/api';
import { donationSchema, type DonationFormData } from '@/lib/validation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { SiteConfig } from '@/lib/config';

interface DonationFormProps {
  config: SiteConfig;
  onPaymentMethodChange?: (method: string) => void;
}

export default function DonationForm({ config, onPaymentMethodChange }: DonationFormProps) {
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      user_name: '',
      user_email: '',
      user_url: '',
      user_message: '',
      amount: '' as any, // handled by input type number
      payment_method: 'wechat',
    },
  });

  const { watch, formState: { isSubmitting } } = form;
  const userMessage = watch('user_message') || '';

  // Watch payment method changes to trigger callback
  const paymentMethod = watch('payment_method');
  React.useEffect(() => {
    if (onPaymentMethodChange && paymentMethod) {
      onPaymentMethodChange(paymentMethod);
    }
  }, [paymentMethod, onPaymentMethodChange]);

  const remainingMessageChars = useMemo(
    () => Math.max(config.form_message_max_length - userMessage.length, 0),
    [userMessage.length, config.form_message_max_length]
  );

  const onSubmit = async (data: DonationFormData) => {
    setSubmitError(null);
    setSuccess(false);

    try {
      await fetchJson('/api/donations', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          user_email: data.user_email || undefined,
          user_url: data.user_url || undefined,
          user_message: data.user_message || undefined,
        }),
      });

      setSuccess(true);
      form.reset({
        user_name: '',
        user_email: '',
        user_url: '',
        user_message: '',
        amount: '' as any,
        payment_method: 'wechat',
      });
      // Reset payment method in parent if needed, or keep as is
      if (onPaymentMethodChange) onPaymentMethodChange('wechat');

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('[投喂小站] Donation form error:', err);
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError('网络错误。请重试。');
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/20 bg-white/80 backdrop-blur-xl rounded-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 tracking-tight">{config.form_title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {config.form_description}
        </p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200 mb-6 rounded-xl">
          <AlertDescription className="text-green-800 font-medium">
            收到啦！你的投喂正在等待确认，感谢你的支持。
          </AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert className="bg-red-50 border-red-200 mb-6 rounded-xl">
          <AlertDescription className="text-red-800 font-medium">
            {submitError}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Payment Method Selection - Visual Cards */}
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-medium text-gray-700">选择支付方式</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  {config.payment_methods.map((method) => (
                    <div
                      key={method.value}
                      onClick={() => {
                        field.onChange(method.value);
                        // onPaymentMethodChange handled by useEffect
                      }}
                      className={cn(
                        "cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 hover:bg-gray-50 group",
                        field.value === method.value
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-transparent bg-gray-50"
                      )}
                    >
                      <div className="w-10 h-10 mb-3 relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        {/* Visual Icons */}
                        {method.value === 'alipay' && (
                          <svg viewBox="0 0 1024 1024" className="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1024 512c0 282.7776-229.2224 512-512 512S0 794.7776 0 512 229.2224 0 512 0s512 229.2224 512 512z" fill="#1677FF" />
                            <path d="M226.4 340.8h571.2v73.6H632c25.6 51.2 46.4 108.8 60.8 168 4.8 19.2-24 27.2-28.8 8-12.8-52.8-30.4-102.4-52.8-148.8H412.8c-22.4 123.2-80 232-161.6 313.6-14.4 14.4-35.2-6.4-20.8-20.8 73.6-73.6 126.4-171.2 147.2-281.6H226.4v-73.6z m313.6 204.8c-36.8 65.6-86.4 123.2-144 169.6-16 12.8-36.8-9.6-20.8-22.4 51.2-41.6 96-92.8 128-150.4 9.6-17.6 46.4-8 36.8 3.2z m200 244.8c-4.8 20.8-36.8 12.8-32-6.4 19.2-84.8 19.2-172.8 0-257.6-4.8-20.8 27.2-27.2 32-6.4 20.8 91.2 20.8 185.6 0 270.4z" fill="#FFFFFF" />
                          </svg>
                        )}
                        {method.value === 'wechat' && (
                          <svg viewBox="0 0 1024 1024" className="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <path d="M512 1024C229.248 1024 0 794.752 0 512S229.248 0 512 0s512 229.248 512 512-229.248 512-512 512z" fill="#07C160" />
                            <path d="M668.8 566.4c-76.8 0-139.2-59.2-139.2-131.2s62.4-131.2 139.2-131.2c76.8 0 139.2 59.2 139.2 131.2s-62.4 131.2-139.2 131.2z m-48-156.8c-9.6 0-17.6 8-17.6 17.6s8 17.6 17.6 17.6 17.6-8 17.6-17.6-8-17.6-17.6-17.6z m99.2 0c-9.6 0-17.6 8-17.6 17.6s8 17.6 17.6 17.6 17.6-8 17.6-17.6-8-17.6-17.6-17.6z m-379.2 97.6c-89.6 0-161.6-68.8-161.6-153.6 0-84.8 72-153.6 161.6-153.6s161.6 68.8 161.6 153.6c0 84.8-72 153.6-161.6 153.6z m-56-182.4c-11.2 0-20.8 8.8-20.8 19.2s9.6 19.2 20.8 19.2 20.8-8.8 20.8-19.2-8.8-19.2-20.8-19.2z m115.2 0c-11.2 0-20.8 8.8-20.8 19.2s9.6 19.2 20.8 19.2 20.8-8.8 20.8-19.2-8.8-19.2-20.8-19.2z" fill="#FFFFFF" />
                          </svg>
                        )}
                        {method.value === 'qq' && (
                          <svg viewBox="0 0 1024 1024" className="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.4 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" fill="#12B7F5" />
                            <path d="M512 816c-112 0-192-64-192-64s32 128 192 128 192-128 192-128-80 64-192 64z" fill="#FFFFFF" />
                          </svg>
                        )}
                        {method.value === 'other' && (
                          <div className="w-full h-full rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">...</div>
                        )}
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        field.value === method.value ? "text-blue-700" : "text-gray-600"
                      )}>
                        {method.label}
                      </span>
                      {field.value === method.value && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">昵称</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="想怎么称呼你呢"
                      maxLength={config.form_name_max_length}
                      {...field}
                      className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">投喂金额</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">¥</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder={String(config.form_amount_min)}
                        min={config.form_amount_min}
                        max={config.form_amount_max}
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                        className="h-12 pl-8 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500/20 transition-all font-medium"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="user_message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">留言 <span className="text-gray-400 font-normal">(可选)</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="想对我们说的悄悄话..."
                    maxLength={config.form_message_max_length}
                    rows={3}
                    {...field}
                    className="resize-none rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500/20 transition-all"
                  />
                </FormControl>
                <div className="text-right text-xs text-gray-400 mt-1">
                  {field.value?.length || 0}/{config.form_message_max_length}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Collapsible/Optional Fields could go here to keep it clean, but for now keep simple */}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-medium shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                投喂中...
              </>
            ) : (
              '确认投喂'
            )}
          </Button>
        </form>
      </Form>

      <p className="text-xs text-gray-400 text-center mt-6">
        {config.form_privacy_text}
      </p>
    </Card>
  );
}
