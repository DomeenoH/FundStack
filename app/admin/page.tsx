'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, LogOut, Check, X, Search, Download, Reply, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUserAvatarUrl } from '@/lib/avatar-utils';
import { Tooltip } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminDonation {
  id: number;
  user_name: string;
  user_email?: string;
  user_url?: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  user_message?: string;
  reply_content?: string;
  reply_at?: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [donations, setDonations] = useState<AdminDonation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed'>('pending');
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Reply state
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credentials = btoa(`admin:${password}`);
      const response = await fetch('/api/admin/donations', {
        headers: { 'Authorization': `Basic ${credentials}` }
      });

      if (response.ok) {
        setAuthenticated(true);
        localStorage.setItem('adminToken', credentials); // Store token
        const data = await response.json();
        setDonations(data.donations);
      } else {
        setError('密码错误');
      }
    } catch (err) {
      console.error('[投喂小站] Login error:', err);
      setError('登录失败。请重试。');
    } finally {
      setLoading(false);
    }
  };

  const updateDonationStatus = async (
    id: number,
    status: 'pending' | 'confirmed' | 'rejected',
    successText: string
  ) => {
    setActioningId(id);
    setError('');
    try {
      const credentials = btoa(`admin:${password}`);

      const response = await fetch('/api/admin/donations', {
        method: 'PATCH',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status })
      });

      if (response.ok) {
        setDonations(prev =>
          prev.map(d => d.id === id ? { ...d, status } : d)
        );
        setSuccessMessage(successText);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('状态更新失败');
      }
    } catch (err) {
      console.error('[投喂小站] Status update error:', err);
      setError('修改状态失败');
    } finally {
      setActioningId(null);
    }
  };

  const handleReplySubmit = async (id: number) => {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      const credentials = btoa(`admin:${password}`);
      const response = await fetch(`/api/donations/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify({ content: replyContent })
      });

      if (response.ok) {
        const updatedDonation = await response.json();
        setDonations(prev => prev.map(d => d.id === id ? { ...d, ...updatedDonation.donation } : d));
        setSuccessMessage('回复已发送');
        setTimeout(() => setSuccessMessage(''), 3000);
        setReplyingId(null);
        setReplyContent('');
      } else {
        setError('回复失败');
      }
    } catch (error) {
      console.error('Reply error:', error);
      setError('回复出错');
    } finally {
      setSubmittingReply(false);
    }
  };

  const openReplyDialog = (donation: AdminDonation) => {
    setReplyingId(donation.id);
    setReplyContent(donation.reply_content || '');
  };

  const exportToCSV = () => {
    const headers = ['ID', '投喂者', '邮箱', '金额', '方式', '留言', '回复', '状态', '时间'];
    const csvData = filteredAndSearchedDonations.map(d => [
      d.id,
      d.user_name,
      d.user_email || '',
      d.amount,
      d.payment_method,
      d.user_message || '',
      d.reply_content || '',
      d.status,
      new Date(d.created_at).toLocaleString('zh-CN')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredDonations = filterStatus === 'all'
    ? donations
    : donations.filter(d => d.status === filterStatus);

  const filteredAndSearchedDonations = filteredDonations.filter(d => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      d.user_name.toLowerCase().includes(query) ||
      d.user_email?.toLowerCase().includes(query) ||
      d.user_message?.toLowerCase().includes(query) ||
      d.reply_content?.toLowerCase().includes(query)
    );
  });

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-3xl font-bold mb-2">管理面板</h1>
          <p className="text-gray-600 mb-6">输入您的管理员密码</p>

          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理员密码"
              required
            />
            <Button disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在验证...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">投喂管理仪表板</h1>
          <div className="flex gap-2 md:gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/admin/config'}
            >
              站点配置
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAuthenticated(false);
                setPassword('');
                setDonations([]);
                localStorage.removeItem('adminToken');
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </Button>
          </div>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">投喂管理</h2>
                <p className="text-sm text-gray-600 mt-1">
                  记录：{donations.length} |
                  待处理：{donations.filter(d => d.status === 'pending').length} |
                  已确认：{donations.filter(d => d.status === 'confirmed').length}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={exportToCSV}
                disabled={filteredAndSearchedDonations.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                导出 CSV
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="搜索投喂者名称、邮箱、留言或回复..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
              >
                待处理
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('confirmed')}
              >
                已确认
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                全部
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 md:mx-0">
            <div className="inline-block min-w-full align-middle px-6 md:px-0">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left font-medium whitespace-nowrap">头像</th>
                    <th className="px-4 md:px-6 py-3 text-left font-medium whitespace-nowrap">投喂者</th>
                    <th className="px-4 md:px-6 py-3 text-left font-medium whitespace-nowrap">金额</th>
                    <th className="px-4 md:px-6 py-3 text-left font-medium whitespace-nowrap">方式</th>
                    <th className="px-4 md:px-6 py-3 text-left font-medium whitespace-nowrap">留言/回复</th>
                    <th className="px-4 md:px-6 py-3 text-left font-medium whitespace-nowrap">状态</th>
                    <th className="px-4 md:px-6 py-3 text-left font-medium whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAndSearchedDonations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        {searchQuery ? '未找到匹配的记录' : '暂无投喂记录'}
                      </td>
                    </tr>
                  ) : (
                    filteredAndSearchedDonations.map(donation => (
                      <tr key={donation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <img src={getUserAvatarUrl(donation.user_email, 40)} alt="avatar" className="w-8 h-8 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{donation.user_name}</div>
                          <div className="text-xs text-gray-500">{donation.user_email || '-'}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold">¥{donation.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">{donation.payment_method}</td>
                        <td className="px-6 py-4 text-sm max-w-xs">
                          <div className="flex flex-col gap-1">
                            <div className="text-gray-800 truncate" title={donation.user_message}>
                              {donation.user_message || <span className="text-gray-400 italic">无留言</span>}
                            </div>
                            {donation.reply_content && (
                              <div className="text-blue-600 text-xs flex items-center gap-1 truncate" title={donation.reply_content}>
                                <Reply className="w-3 h-3" />
                                {donation.reply_content}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${donation.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : donation.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {donation.status === 'confirmed' ? '已确认' : donation.status === 'rejected' ? '已拒绝' : '待确认'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 items-center">
                            <Dialog open={replyingId === donation.id} onOpenChange={(open) => !open && setReplyingId(null)}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => openReplyDialog(donation)}>
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>回复 {donation.user_name}</DialogTitle>
                                  <DialogDescription>
                                    发送回复给投喂者，回复内容将显示在投喂墙上。
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="输入回复内容..."
                                    rows={4}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setReplyingId(null)}>取消</Button>
                                  <Button onClick={() => handleReplySubmit(donation.id)} disabled={submittingReply || !replyContent.trim()}>
                                    {submittingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    发送回复
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {filterStatus === 'all' ? (
                              <select
                                className="rounded border px-3 py-2 text-sm"
                                value={donation.status}
                                disabled={actioningId === donation.id}
                                onChange={(e) =>
                                  updateDonationStatus(
                                    donation.id,
                                    e.target.value as 'pending' | 'confirmed' | 'rejected',
                                    '状态已更新'
                                  )
                                }
                              >
                                <option value="pending">未确认</option>
                                <option value="confirmed">已通过</option>
                                <option value="rejected">已拒绝</option>
                              </select>
                            ) : (
                              donation.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => updateDonationStatus(donation.id, 'confirmed', '投喂已通过')}
                                    disabled={actioningId === donation.id}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {actioningId === donation.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Check className="mr-1 h-4 w-4" />
                                        确认
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateDonationStatus(donation.id, 'rejected', '投喂已标记为拒绝')}
                                    disabled={actioningId === donation.id}
                                  >
                                    {actioningId === donation.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <X className="mr-1 h-4 w-4" />
                                        拒绝
                                      </>
                                    )}
                                  </Button>
                                </>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
