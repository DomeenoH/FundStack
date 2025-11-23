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
import { Loader2 } from 'lucide-react';
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
                        "cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 hover:bg-gray-50",
                        field.value === method.value
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-transparent bg-gray-50"
                      )}
                    >
                      <div className="w-8 h-8 mb-2 relative flex items-center justify-center">
                        {/* Visual placeholders/Icons */}
                        {method.value === 'alipay' && (
                          <div className="w-full h-full rounded bg-[#1677FF] flex items-center justify-center text-white font-bold text-xs">支</div>
                        )}
                        {method.value === 'wechat' && (
                          <div className="w-full h-full rounded bg-[#07C160] flex items-center justify-center text-white font-bold text-xs">微</div>
                        )}
                        {method.value === 'qq' && (
                          <div className="w-full h-full rounded bg-[#12B7F5] flex items-center justify-center text-white font-bold text-xs">Q</div>
                        )}
                        {method.value === 'other' && (
                          <div className="w-full h-full rounded bg-gray-400 flex items-center justify-center text-white font-bold text-xs">...</div>
                        )}
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        field.value === method.value ? "text-blue-700" : "text-gray-600"
                      )}>
                        {method.label}
                      </span>
                      {field.value === method.value && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
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
