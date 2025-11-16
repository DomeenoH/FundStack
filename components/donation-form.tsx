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
        setError(data.errors || [data.error || 'Submission failed']);
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
      setError(['Network error. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Support Us</h2>
          <p className="text-sm text-gray-600">
            Your donation helps us maintain and improve our services
          </p>
        </div>

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Thank you for your donation! It has been added to the donation list and is pending confirmation.
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
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="user_name"
              value={form.user_name}
              onChange={handleChange}
              placeholder="Your name"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              name="user_email"
              type="email"
              value={form.user_email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
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
              Amount (¥) <span className="text-red-500">*</span>
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
            <p className="text-xs text-gray-500 mt-1">Between 0.01 and 99999.99</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <Select value={form.payment_method} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wechat">WeChat Pay</SelectItem>
                <SelectItem value="alipay">Alipay</SelectItem>
                <SelectItem value="qq">QQ Pay</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <Textarea
              name="user_message"
              value={form.user_message}
              onChange={handleChange}
              placeholder="Leave a message (optional)"
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
                Submitting...
              </>
            ) : (
              'Submit Donation'
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Your data will be processed securely and only used for donation purposes.
        </p>
      </Card>
    </div>
  );
}
