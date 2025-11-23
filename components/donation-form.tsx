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
                            <path d="M492.343 777.511c-67.093 32.018-144.129 51.939-227.552 32.27-83.424-19.678-142.626-73.023-132.453-171.512 10.192-98.496 115.478-132.461 202.07-132.461 86.622 0 250.938 56.122 250.938 56.122s13.807-30.937 27.222-66.307c13.405-35.365 17.21-63.785 17.21-63.785H279.869v-35.067h169.995v-67.087l-211.925 1.526v-44.218h211.925v-100.63h111.304v100.629H788.35v44.218l-227.181 1.524v62.511l187.584 1.526s-3.391 35.067-27.17 98.852c-23.755 63.783-46.061 96.312-46.061 96.312L960 685.279V243.2C960 144.231 879.769 64 780.8 64H243.2C144.231 64 64 144.231 64 243.2v537.6C64 879.769 144.231 960 243.2 960h537.6c82.487 0 151.773-55.806 172.624-131.668L625.21 672.744s-65.782 72.748-132.867 104.767z" fill="#1677FF" />
                            <path d="M297.978 559.871c-104.456 6.649-129.974 52.605-129.974 94.891s25.792 101.073 148.548 101.073c122.727 0 226.909-123.77 226.909-123.77s-141.057-78.842-245.483-72.194z" fill="#1677FF" />
                          </svg>
                        )}
                        {method.value === 'wechat' && (
                          <svg viewBox="0 0 1024 1024" className="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <path d="M664.250054 368.541681c10.015098 0 19.892049 0.732687 29.67281 1.795902-26.647917-122.810047-159.358451-214.077703-310.826188-214.077703-169.353083 0-308.085774 114.232694-308.085774 259.274068 0 83.708494 46.165436 152.460344 123.281791 205.78483l-30.80868 91.730191 107.688651-53.455469c38.558178 7.53665 69.459978 15.308661 107.924012 15.308661 9.66308 0 19.230993-0.470721 28.752858-1.225921-6.025227-20.36584-9.521864-41.723264-9.521864-63.862493C402.328693 476.632491 517.908058 368.541681 664.250054 368.541681zM498.62897 285.87389c23.200398 0 38.557154 15.120372 38.557154 38.061874 0 22.846334-15.356756 38.156018-38.557154 38.156018-23.107277 0-46.260603-15.309684-46.260603-38.156018C452.368366 300.994262 475.522716 285.87389 498.62897 285.87389zM283.016307 362.090758c-23.107277 0-46.402843-15.309684-46.402843-38.156018 0-22.941502 23.295566-38.061874 46.402843-38.061874 23.081695 0 38.46301 15.120372 38.46301 38.061874C321.479317 346.782098 306.098002 362.090758 283.016307 362.090758zM945.448458 606.151333c0-121.888048-123.258255-221.236753-261.683954-221.236753-146.57838 0-262.015505 99.348706-262.015505 221.236753 0 122.06508 115.437126 221.200938 262.015505 221.200938 30.66644 0 61.617359-7.609305 92.423993-15.262612l84.513836 45.786813-23.178909-76.17082C899.379213 735.776599 945.448458 674.90216 945.448458 606.151333zM598.803483 567.994292c-15.332197 0-30.807656-15.096836-30.807656-30.501688 0-15.190981 15.47546-30.477129 30.807656-30.477129 23.295566 0 38.558178 15.286148 38.558178 30.477129C637.361661 552.897456 622.099049 567.994292 598.803483 567.994292zM768.25071 567.994292c-15.213493 0-30.594809-15.096836-30.594809-30.501688 0-15.190981 15.381315-30.477129 30.594809-30.477129 23.107277 0 38.558178 15.286148 38.558178 30.477129C806.808888 552.897456 791.357987 567.994292 768.25071 567.994292z" fill="#07C160" />
                          </svg>
                        )}
                        {method.value === 'qq' && (
                          <svg viewBox="0 0 1024 1024" className="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" fill="#12B7F5" />
                          </svg>
                        )}
                        {method.value === 'other' && (
                          <svg viewBox="0 0 1024 1024" className="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <path d="M511.670857 128c171.995429 0 311.917714 141.677714 311.917714 315.794286 0 78.994286-30.061714 155.428571-82.651428 213.357714 52.004571 20.553143 102.692571 41.472 120.027428 48.713143 10.166857 4.205714 16.822857 14.262857 16.749715 25.380571v137.289143c0 15.177143-12.105143 27.465143-27.136 27.465143H445.44c-112.859429 0-253.44-148.443429-289.609143-244.662857-19.602286-52.297143-5.266286-79.872 10.203429-93.769143a63.305143 63.305143 0 0 1 42.642285-16.969143c41.764571 0 80.164571 41.325714 120.795429 85.028572 28.562286 30.72 60.928 65.536 87.405714 75.885714a456.045714 456.045714 0 0 0 163.401143 30.464c-16.310857-20.918857-30.061714-40.009143-33.682286-49.152-5.924571-14.994286-3.328-33.024 6.838858-48.274286 12.251429-18.285714 32.402286-28.16 53.504-24.832 12.214857 1.901714 43.154286 12.653714 79.433142 26.331429 0.621714-0.658286 0.914286-1.536 1.536-2.194286a259.474286 259.474286 0 0 0 81.481143-190.061714c0-143.835429-115.602286-260.864-257.682285-260.864-142.043429 0-257.609143 117.028571-257.609143 260.864 0 11.556571 0.731429 23.003429 2.194285 34.011428a27.428571 27.428571 0 0 1-23.405714 30.829715 27.428571 27.428571 0 0 1-30.427428-23.661715 321.609143 321.609143 0 0 1-2.596572-41.179428c0-174.116571 139.885714-315.794286 311.844572-315.794286zM408.539429 329.142857c11.300571 0.146286 22.491429 0 33.792 0.146286 23.552 0.146286 46.921143 0.146286 70.363428 0.146286h101.449143c6.838857 0 7.899429 1.645714 7.497143 11.373714-0.658286 13.714286-6.144 20.955429-16.091429 20.955428h-61.805714c-7.497143 0-7.789714 1.024-8.009143 11.227429-0.438857 17.078857 0 17.554286 8.301714 17.444571h55.003429c11.483429 0 16.896 7.936 16.786286 24.137143-0.109714 34.413714-0.109714 32.402286 0 66.779429 0.109714 23.478857-12.141714 41.325714-28.964572 41.764571h-13.165714c-3.84 0.146286-5.412571-1.901714-5.412571-7.387428 0.219429-40.265143 0.109714-44.141714 0.292571-84.443429 0-6.509714-1.792-8.850286-6.217143-8.704-6.875429 0.146286-13.750857 0.292571-20.589714 0-4.461714-0.146286-6.363429 2.194286-6.363429 8.557714l0.219429 103.314286c0 28.781714-11.812571 45.348571-32.329143 45.458286h-10.020571c-3.401143 0-5.302857-2.048-5.302858-7.094857 0.109714-46.445714 0.109714-92.964571 0.329143-139.446857 0-9.618286-0.548571-10.788571-7.204571-10.788572s-13.421714 0-20.077714-0.146286c-4.022857-0.146286-5.705143 2.340571-5.595429 7.972572 0.219429 28.489143 0.219429 20.553143 0.329143 49.005714 0 26.733714-11.702857 43.410286-30.866286 43.556572-3.913143 0-7.68-0.146286-11.593143 0-3.730286 0.146286-5.412571-1.901714-5.412571-7.387429 0.109714-46.774857 0-56.832 0.109714-103.643429 0-13.129143 6.144-21.540571 15.652572-21.686857 19.017143-0.146286 38.034286 0 57.051428 0 7.168 0 7.826286-0.877714 7.497143-11.081143 0-0.731429 0-1.462857-0.109714-2.194285-0.182857-14.226286-0.219429-15.396571-9.069715-15.506286h-59.721142c-11.300571 0-16.822857-7.826286-17.005715-23.478857-0.109714-6.326857 1.682286-8.996571 6.217143-8.850286z" fill="#515151" />
                          </svg>
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
