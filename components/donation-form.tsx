'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
}

export default function DonationForm({ config }: DonationFormProps) {
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
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('[v0] Donation form error:', err);
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError('网络错误。请重试。');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{config.form_title}</h2>
          <p className="text-sm text-gray-600">
            {config.form_description}
          </p>
        </div>

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              收到啦！你的投喂正在等待确认，感谢你的支持。
            </AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    昵称 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="想怎么称呼你呢" maxLength={config.form_name_max_length} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>主页/链接</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="展示你的树洞或作品" {...field} />
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
                  <FormLabel>
                    投喂金额（¥） <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={String(config.form_amount_min)}
                      min={config.form_amount_min}
                      max={config.form_amount_max}
                      step="0.01"
                      {...field}
                      onChange={e => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">小额也珍贵：{config.form_amount_min} - {config.form_amount_max}</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    支付方式 <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {config.payment_methods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>留言</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="想对我们说的悄悄话（可选）"
                      maxLength={config.form_message_max_length}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <span>分享一下你的心声（可选）</span>
                    <span>
                      {field.value?.length || 0}/{config.form_message_max_length} （剩余 {remainingMessageChars}）
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  投喂中...
                </>
              ) : (
                '提交投喂'
              )}
            </Button>
          </form>
        </Form>

        <p className="text-xs text-gray-500 text-center">
          {config.form_privacy_text}
        </p>
      </Card>
    </div>
  );
}
