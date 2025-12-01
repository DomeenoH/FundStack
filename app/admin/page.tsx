'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, LogOut, Check, X, Search, Download, Reply, MessageSquare, Settings, Wallet, Users, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUserAvatarUrl } from '@/lib/avatar-utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

const PAYMENT_METHOD_LABELS = {
  wechat: '微信',
  alipay: '支付宝',
  qq: 'QQ支付',
  other: '其他',
};

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

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        setLoading(true);
        try {
          const response = await fetch('/api/admin/donations', {
            headers: { 'Authorization': `Basic ${token}` }
          });

          if (response.ok) {
            setAuthenticated(true);
            const data = await response.json();
            setDonations(data.donations);

            // Check if there are any pending donations
            const hasPending = data.donations.some((d: AdminDonation) => d.status === 'pending');
            if (!hasPending) {
              setFilterStatus('all');
            }
          } else {
            // Token invalid or expired
            localStorage.removeItem('adminToken');
          }
        } catch (err) {
          console.error('Session check error:', err);
          // Don't clear token on network error, just let user try to login manually if they want
        } finally {
          setLoading(false);
        }
      }
    };

    checkSession();
  }, []);

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

        // Check if there are any pending donations
        const hasPending = data.donations.some((d: AdminDonation) => d.status === 'pending');
        if (!hasPending) {
          setFilterStatus('all');
        }
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

  const stats = {
    total: donations.length,
    pending: donations.filter(d => d.status === 'pending').length,
    confirmed: donations.filter(d => d.status === 'confirmed').length,
    totalAmount: donations.filter(d => d.status === 'confirmed').reduce((acc, curr) => acc + curr.amount, 0)
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">管理面板</h1>
            <p className="text-gray-500 mt-2">请输入管理员密码以继续</p>
          </div>

          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
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
              className="h-11"
            />
            <Button disabled={loading} className="w-full h-11 text-base">
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
    <TooltipProvider>
      <main className="min-h-screen bg-slate-50/50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-20 px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">投喂管理仪表板</h1>
              <p className="text-sm text-gray-500 mt-1">管理所有的投喂记录和站点配置</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.href = '/admin/config'}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <Settings className="mr-2 h-4 w-4" />
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
                className="text-gray-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                退出
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-4 shadow-sm border-blue-100 bg-blue-50/50">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600/80">总收入 (已确认)</p>
                <p className="text-2xl font-bold text-blue-700">¥{stats.totalAmount.toFixed(2)}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">待处理</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">已确认</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-gray-100 rounded-full text-gray-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">总记录</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </Card>
          </div>

          {successMessage && (
            <Alert className="bg-green-50 border-green-200 text-green-800 animate-in fade-in slide-in-from-top-2">
              <Check className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-50 border-red-200 text-red-800 animate-in fade-in slide-in-from-top-2">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50 flex flex-col sm:flex-row justify-between gap-4 items-center">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="搜索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white"
                  />
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                      filterStatus === 'pending' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    待处理
                  </button>
                  <button
                    onClick={() => setFilterStatus('confirmed')}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                      filterStatus === 'confirmed' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    已确认
                  </button>
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                      filterStatus === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    全部
                  </button>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredAndSearchedDonations.length === 0}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                导出 CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                  <tr>
                    <th className="px-6 py-3 w-16">头像</th>
                    <th className="px-6 py-3">投喂者信息</th>
                    <th className="px-6 py-3">金额</th>
                    <th className="px-6 py-3">留言/回复</th>
                    <th className="px-6 py-3">状态</th>
                    <th className="px-6 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAndSearchedDonations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 text-gray-300" />
                          <p>{searchQuery ? '未找到匹配的记录' : '暂无投喂记录'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSearchedDonations.map(donation => (
                      <tr key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <img src={getUserAvatarUrl(donation.user_email, 40)} alt="avatar" className="w-10 h-10 rounded-full border border-gray-100 shadow-sm object-cover" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{donation.user_name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            {donation.user_email || '无邮箱'}
                            <span className="w-1 h-1 rounded-full bg-gray-300 mx-1" />
                            {PAYMENT_METHOD_LABELS[donation.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || donation.payment_method}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(donation.created_at).toLocaleString('zh-CN')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">¥{donation.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex flex-col gap-2">
                            {donation.user_message ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-gray-700 truncate cursor-help border-l-2 border-gray-200 pl-2 text-xs">
                                    {donation.user_message}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{donation.user_message}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-gray-400 text-xs italic">无留言</span>
                            )}

                            {donation.reply_content && (
                              <div className="flex items-start gap-1.5 text-blue-600 text-xs bg-blue-50 p-2 rounded-md">
                                <Reply className="w-3 h-3 mt-0.5 shrink-0" />
                                <span className="truncate" title={donation.reply_content}>{donation.reply_content}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-medium",
                              donation.status === 'confirmed' && "bg-green-100 text-green-700 hover:bg-green-100",
                              donation.status === 'rejected' && "bg-red-100 text-red-700 hover:bg-red-100",
                              donation.status === 'pending' && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                            )}
                          >
                            {donation.status === 'confirmed' ? '已确认' : donation.status === 'rejected' ? '已拒绝' : '待确认'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            <Dialog open={replyingId === donation.id} onOpenChange={(open) => !open && setReplyingId(null)}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" onClick={() => openReplyDialog(donation)} className="h-8 w-8 p-0">
                                  <MessageSquare className="w-4 h-4 text-gray-500" />
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
                                className="h-8 rounded-md border border-gray-200 text-xs px-2 bg-white"
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
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        onClick={() => updateDonationStatus(donation.id, 'confirmed', '投喂已通过')}
                                        disabled={actioningId === donation.id}
                                        className="h-8 w-8 p-0 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200 border"
                                      >
                                        {actioningId === donation.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Check className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>确认通过</TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => updateDonationStatus(donation.id, 'rejected', '投喂已标记为拒绝')}
                                        disabled={actioningId === donation.id}
                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                                      >
                                        {actioningId === donation.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <X className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>拒绝</TooltipContent>
                                  </Tooltip>
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
          </Card>
        </div>
      </main>
    </TooltipProvider>
  );
}
