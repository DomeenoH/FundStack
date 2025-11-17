'use client';

import { useState } from 'react';
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

interface FormState {
  user_name: string;
  user_email: string;
  user_url: string;
  user_message: string;
  amount: string;
  payment_method: string;
}

export default function DonationForm() {
  const [form, setForm] = useState<FormState>({
    user_name: '',
    user_email: '',
    user_url: '',
    user_message: '',
    amount: '',
    payment_method: 'wechat',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setForm(prev => ({ ...prev, payment_method: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError([]);
    setSuccess(false);

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: form.user_name,
          user_email: form.user_email || undefined,
          user_url: form.user_url || undefined,
          user_message: form.user_message || undefined,
          amount: parseFloat(form.amount),
          payment_method: form.payment_method,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.errors || [data.error || '提交失败']);
      } else {
        setSuccess(true);
        setForm({
          user_name: '',
          user_email: '',
          user_url: '',
          user_message: '',
          amount: '',
          payment_method: 'wechat',
        });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('[v0] Donation form error:', err);
      setError(['网络错误。请重试。']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">支持我们</h2>
          <p className="text-sm text-gray-600">
            您的捐赠帮助我们维护和改进我们的服务
          </p>
        </div>

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              感谢您的捐赠！它已添加到捐赠列表中，等待确认。
            </AlertDescription>
          </Alert>
        )}

        {error.length > 0 && (
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              <ul className="list-disc list-inside space-y-1">
                {error.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              姓名 <span className="text-red-500">*</span>
            </label>
            <Input
              name="user_name"
              value={form.user_name}
              onChange={handleChange}
              placeholder="您的名字"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">邮箱</label>
            <Input
              name="user_email"
              type="email"
              value={form.user_email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">网站</label>
            <Input
              name="user_url"
              type="url"
              value={form.user_url}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              金额（¥） <span className="text-red-500">*</span>
            </label>
            <Input
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.01"
              min="0.01"
              max="99999.99"
              step="0.01"
              required
            />
            <p className="text-xs text-gray-500 mt-1">金额范围：0.01 - 99999.99</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              支付方式 <span className="text-red-500">*</span>
            </label>
            <Select value={form.payment_method} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wechat">微信支付</SelectItem>
                <SelectItem value="alipay">支付宝</SelectItem>
                <SelectItem value="qq">QQ支付</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">留言</label>
            <Textarea
              name="user_message"
              value={form.user_message}
              onChange={handleChange}
              placeholder="留下您的留言（可选）"
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.user_message.length}/500
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                提交中...
              </>
            ) : (
              '提交捐赠'
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center">
          您的数据将被安全处理，仅用于捐赠目的。
        </p>
      </Card>
    </div>
  );
}
