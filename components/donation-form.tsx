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
                          <svg viewBox="0 0 1024 1024" className="w-full h-full text-[#1677FF] fill-current" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M1024 512c0 282.7776-229.2224 512-512 512S0 794.7776 0 512 229.2224 0 512 0s512 229.2224 512 512z" fill="#1677FF"></path><path d="M788.6336 381.184c-17.152-11.4176-39.68-6.144-50.688 11.776-36.9664 60.16-83.3024 114.688-137.472 161.792-50.3296-36.5056-94.8224-81.2032-132.096-132.608h158.5664c21.2992 0 38.6048-17.3056 38.6048-38.6048 0-21.2992-17.3056-38.6048-38.6048-38.6048h-201.216v-41.984c0-21.2992-17.3056-38.6048-38.6048-38.6048-21.2992 0-38.6048 17.3056-38.6048 38.6048v41.984H157.2864c-21.2992 0-38.6048 17.3056-38.6048 38.6048 0 21.2992 17.3056 38.6048 38.6048 38.6048h228.864c33.0752 44.544 72.192 83.4048 115.968 115.4048-52.6848 37.9904-111.9232 67.84-175.7696 88.064-20.2752 6.4-31.5904 28.0576-25.1904 48.3328 5.2736 16.6912 20.6848 27.2896 37.2736 27.2896 3.6352 0 7.3216-0.4608 10.9568-1.6384 72.8064-23.0912 140.3392-57.1392 200.3968-100.4544 49.3056 46.1824 104.96 85.5552 165.1712 116.3776-35.3792 84.992-94.5664 160.768-171.1104 218.4704-17.0496 12.8512-20.48 37.12-7.6288 54.1696 8.3968 11.1616 21.4528 17.0496 34.6624 17.0496 6.8096 0 13.6704-1.5872 19.968-4.8128 90.1632-46.4384 166.7584-112.4864 223.744-191.6928 12.9024-17.92 8.7552-42.8544-9.1648-55.7056-17.92-12.9024-42.8544-8.7552-55.7056 9.1648-38.5024 53.504-88.832 98.6624-148.4288 132.608-54.528-28.8768-104.9088-65.0752-149.504-107.2128 62.464-51.5072 115.8656-111.872 158.0544-179.4048 11.0592-17.92 5.8368-42.1888-12.0832-53.248z" fill="#FFFFFF"></path></svg>
                        )}
                        {method.value === 'wechat' && (
                          <svg viewBox="0 0 1024 1024" className="w-full h-full text-[#07C160] fill-current" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 1024C229.248 1024 0 794.752 0 512S229.248 0 512 0s512 229.248 512 512-229.248 512-512 512z" fill="#07C160"></path><path d="M661.12 559.232c-72.96 0-132.224-55.808-132.224-124.672s59.264-124.672 132.224-124.672c72.96 0 132.224 55.808 132.224 124.672s-59.264 124.672-132.224 124.672z m-45.312-148.224c-9.088 0-16.512 7.04-16.512 15.616 0 8.576 7.424 15.616 16.512 15.616 9.088 0 16.512-7.04 16.512-15.616 0-8.576-7.424-15.616-16.512-15.616z m94.464 0c-9.088 0-16.512 7.04-16.512 15.616 0 8.576 7.424 15.616 16.512 15.616 9.088 0 16.512-7.04 16.512-15.616 0-8.576-7.424-15.616-16.512-15.616z m-359.552 92.416c-85.12 0-154.24-65.024-154.24-145.28 0-80.256 69.12-145.28 154.24-145.28s154.24 65.024 154.24 145.28c0 80.256-69.12 145.28-154.24 145.28z m-52.864-172.672c-10.624 0-19.2 8.192-19.2 18.176 0 9.984 8.576 18.176 19.2 18.176 10.624 0 19.2-8.192 19.2-18.176 0-9.984-8.576-18.176-19.2-18.176z m110.208 0c-10.624 0-19.2 8.192-19.2 18.176 0 9.984 8.576 18.176 19.2 18.176 10.624 0 19.2-8.192 19.2-18.176 0-9.984-8.576-18.176-19.2-18.176z" fill="#FFFFFF"></path><path d="M678.912 590.336c-3.2 0-6.4-0.384-9.6-1.152-2.688-0.64-5.376-1.408-7.936-2.304-106.368-36.864-183.168-132.096-183.168-243.584 0-143.232 126.336-259.84 282.112-259.84s282.112 116.608 282.112 259.84c0 143.232-126.336 259.84-282.112 259.84-30.976 0-60.8-4.608-89.216-13.312l-69.76 35.2c-4.48 2.304-9.728 1.92-13.824-0.896-4.224-2.944-6.272-8.064-5.248-13.056l13.696-66.304c-11.264-15.616-19.328-32.768-23.808-50.688 2.688 0.64 5.376 1.152 8.192 1.152 14.208 0 27.904-2.176 41.088-6.144 3.072 12.032 8.448 23.424 15.872 33.92l-8.704 42.112 44.288-22.4c3.2-1.664 6.784-2.432 10.368-2.432 2.176 0 4.352 0.256 6.528 0.896 22.912 7.04 47.104 10.752 72.192 10.752 124.928 0 226.56-93.568 226.56-208.64s-101.632-208.64-226.56-208.64c-124.928 0-226.56 93.568-226.56 208.64 0 74.496 42.624 140.416 107.904 178.56 3.84 2.304 5.632 6.912 4.48 11.264-1.152 4.352-4.608 7.68-8.96 8.448-6.272 1.152-12.672 1.792-19.2 1.792z" fill="#FFFFFF"></path></svg>
                        )}
                        {method.value === 'qq' && (
                          <svg viewBox="0 0 1024 1024" className="w-full h-full text-[#12B7F5] fill-current" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.4 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" fill="#12B7F5"></path></svg>
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
