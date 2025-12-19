'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, LogOut, Check, X, Search, Download, Reply, MessageSquare, Settings, Wallet, Users, Clock, Pencil, Trash2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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

  // Edit state
  const [editingDonation, setEditingDonation] = useState<AdminDonation | null>(null);
  const [editFormData, setEditFormData] = useState({
    user_name: '',
    user_email: '',
    user_url: ''
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // Load donations on mount
  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        // Note: API route at /api/admin/donations needs to be updated to use session cookie instead of Basic Auth
        // For now, we assume the API route might still be checking Basic Auth which we need to fix next.
        // But actually, the requirements said: "Remove Basic Auth logic" in `app/api/admin/auth.ts`
        // So we should expect the API to be protected by Middleware or Session check as well?
        // The middleware protects the page. The API route should also be protected.
        // We will update the API route separately to verify session.
        const response = await fetch('/api/admin/donations');

        if (response.ok) {
          const data = await response.json();
          setDonations(data.donations);

          // Check if there are any pending donations
          const hasPending = data.donations.some((d: AdminDonation) => d.status === 'pending');
          if (!hasPending) {
            setFilterStatus('all');
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed', error);
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
      const response = await fetch('/api/admin/donations', {
        method: 'PATCH',
        headers: {
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
      const response = await fetch(`/api/donations/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const openEditDialog = (donation: AdminDonation) => {
    setEditingDonation(donation);
    setEditFormData({
      user_name: donation.user_name,
      user_email: donation.user_email || '',
      user_url: donation.user_url || ''
    });
  };

  const handleEditSubmit = async () => {
    if (!editingDonation) return;
    setSubmittingEdit(true);
    try {
      const response = await fetch('/api/admin/donations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingDonation.id,
          action: 'update_info',
          ...editFormData
        })
      });

      if (response.ok) {
        const { donation: updatedDonation } = await response.json();
        setDonations(prev => prev.map(d => d.id === editingDonation.id ? { ...d, ...updatedDonation } : d));
        setSuccessMessage('投喂者信息已更新');
        setTimeout(() => setSuccessMessage(''), 3000);
        setEditingDonation(null);
      } else {
        setError('更新失败');
      }
    } catch (error) {
      console.error('Edit error:', error);
      setError('更新出错');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (deletingIds.length === 0) return;
    setSubmittingDelete(true);
    try {
      const response = await fetch('/api/admin/donations/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: deletingIds })
      });

      if (response.ok) {
        const { deleted } = await response.json();
        setDonations(prev => prev.filter(d => !deletingIds.includes(d.id)));
        setSelectedIds([]);
        setSuccessMessage(`已删除 ${deleted} 条记录`);
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowDeleteConfirm(false);
        setDeletingIds([]);
      } else {
        setError('删除失败');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('删除出错');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSearchedDonations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSearchedDonations.map(d => d.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const openDeleteConfirm = (ids: number[]) => {
    setDeletingIds(ids);
    setShowDeleteConfirm(true);
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
                onClick={handleLogout}
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
              {selectedIds.length > 0 && selectedIds.every(id => {
                const donation = donations.find(d => d.id === id);
                return donation?.status === 'rejected';
              }) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteConfirm(selectedIds)}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除选中 ({selectedIds.length})
                  </Button>
                )}
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
                    <th className="px-4 py-3 w-12">
                      <Checkbox
                        checked={selectedIds.length === filteredAndSearchedDonations.length && filteredAndSearchedDonations.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 w-16 min-w-[5rem] whitespace-nowrap">头像</th>
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
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 text-gray-300" />
                          <p>{searchQuery ? '未找到匹配的记录' : '暂无投喂记录'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSearchedDonations.map(donation => (
                      <tr key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={selectedIds.includes(donation.id)}
                            onCheckedChange={() => toggleSelect(donation.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <img src={getUserAvatarUrl(donation.user_email, 40)} alt="avatar" className="w-10 h-10 rounded-full border border-gray-100 shadow-sm object-cover aspect-square" />
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
                            {/* 回复按钮 */}
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

                            {/* 编辑按钮 */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog(donation)}
                                  className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>编辑投喂者信息</TooltipContent>
                            </Tooltip>

                            {/* 删除按钮 - 仅针对rejected状态 */}
                            {donation.status === 'rejected' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openDeleteConfirm([donation.id])}
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>删除此记录</TooltipContent>
                              </Tooltip>
                            )}

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
          {/* 编辑对话框 */}
          <Dialog open={!!editingDonation} onOpenChange={(open) => !open && setEditingDonation(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑投喂者信息</DialogTitle>
                <DialogDescription>
                  修改投喂者的基本信息。请注意，修改后将立即生效。
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    姓名
                  </Label>
                  <Input
                    id="name"
                    value={editFormData.user_name}
                    onChange={(e) => setEditFormData({ ...editFormData, user_name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    邮箱
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.user_email}
                    onChange={(e) => setEditFormData({ ...editFormData, user_email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    网址
                  </Label>
                  <Input
                    id="url"
                    value={editFormData.user_url}
                    onChange={(e) => setEditFormData({ ...editFormData, user_url: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingDonation(null)}>取消</Button>
                <Button onClick={handleEditSubmit} disabled={submittingEdit}>
                  {submittingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  保存修改
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 删除确认对话框 */}
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认删除</DialogTitle>
                <DialogDescription>
                  您确定要删除这 {deletingIds.length} 条记录吗？此操作无法撤销。
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Alert variant="destructive">
                  <AlertDescription>
                    注意：这将永久从数据库中删除这些投喂记录。
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>取消</Button>
                <Button variant="destructive" onClick={handleDeleteSelected} disabled={submittingDelete}>
                  {submittingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  确认删除
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </TooltipProvider>
  );
}
