'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, User, Calendar, CreditCard, MessageSquare, Reply, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fetchJson } from '@/lib/api';
import { motion } from 'framer-motion';
import { getUserAvatarUrl } from '@/lib/avatar-utils';

interface DonationDetail {
    id: number;
    user_name: string;
    user_email?: string;
    user_url?: string;
    amount: number;
    payment_method: string;
    user_message?: string;
    created_at: string;
    status: string;
    reply_content?: string;
    reply_at?: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    wechat: '微信',
    alipay: '支付宝',
    qq: 'QQ支付',
    other: '其他',
};

const PAYMENT_METHOD_COLORS: Record<string, string> = {
    wechat: 'text-green-600',
    alipay: 'text-blue-600',
    qq: 'text-red-600',
    other: 'text-gray-600',
};

export default function DonationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [donation, setDonation] = useState<DonationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Basic ${token}`;
                }

                const data = await fetchJson<{ donation: DonationDetail; is_admin?: boolean }>(
                    `/api/donations/${params.id}`,
                    { headers }
                );
                setDonation(data.donation);

                // Update admin status based on backend verification
                if (data.is_admin) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                    // If we had a token but backend says not admin, it's invalid/expired
                    if (token) {
                        localStorage.removeItem('adminToken');
                    }
                }
            } catch (err) {
                console.error('Failed to fetch donation details:', err);
                setError('加载投喂详情失败');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadData();
        }
    }, [params.id]);

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;
        setSubmittingReply(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/donations/${params.id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${token}`
                },
                body: JSON.stringify({ content: replyContent })
            });

            if (response.ok) {
                const updatedDonation = await response.json();
                setDonation(prev => prev ? { ...prev, ...updatedDonation.donation } : null);
                setReplyContent('');
            } else {
                alert('回复失败');
            }
        } catch (error) {
            console.error('Reply error:', error);
            alert('回复出错');
        } finally {
            setSubmittingReply(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !donation) {
        return (
            <div className="min-h-screen bg-stone-50 p-8 flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">{error || '找不到该投喂信息'}</p>
                <Link href="/list" className="text-blue-600 hover:underline">
                    返回投喂墙
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-stone-50/50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <Link href="/list" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    返回投喂墙
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <Card className="overflow-hidden border-white/20 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100/50 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full border-4 border-white shadow-sm overflow-hidden">
                                    <img
                                        src={getUserAvatarUrl(donation.user_email, 64)}
                                        alt={donation.user_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{donation.user_name}</h1>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(donation.created_at).toLocaleString('zh-CN')}
                                        </span>
                                        {donation.user_url && (
                                            <a href={donation.user_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                访问主页
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-gray-900">¥{Number(donation.amount).toFixed(2)}</p>
                                <div className="flex items-center justify-end gap-1.5 mt-1">
                                    <span className={`text-sm font-medium ${PAYMENT_METHOD_COLORS[donation.payment_method]}`}>
                                        {PAYMENT_METHOD_LABELS[donation.payment_method]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="p-8 bg-white/50">
                            <div className="flex gap-4">
                                <MessageSquare className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">留言</p>
                                    <p className="text-lg text-gray-800 leading-relaxed">
                                        {donation.user_message || <span className="text-gray-400 italic">没有留言</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reply Section */}
                        {(donation.reply_content || isAdmin) && (
                            <div className="p-8 bg-blue-50/30 border-t border-blue-100/50">
                                <div className="flex gap-4">
                                    <Reply className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-600 mb-2 uppercase tracking-wider">
                                            站长回复
                                            {donation.reply_at && (
                                                <span className="text-blue-400 ml-2 text-xs normal-case">
                                                    {new Date(donation.reply_at).toLocaleString('zh-CN')}
                                                </span>
                                            )}
                                        </p>

                                        {donation.reply_content ? (
                                            <p className="text-gray-800 leading-relaxed bg-white/60 p-4 rounded-xl border border-blue-100/50">
                                                {donation.reply_content}
                                            </p>
                                        ) : (
                                            !isAdmin && <p className="text-gray-400 italic">暂无回复</p>
                                        )}

                                        {isAdmin && (
                                            <div className="mt-4 space-y-3">
                                                <Textarea
                                                    placeholder="输入回复内容..."
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    className="bg-white"
                                                />
                                                <div className="flex justify-end">
                                                    <Button
                                                        onClick={handleReplySubmit}
                                                        disabled={submittingReply || !replyContent.trim()}
                                                        size="sm"
                                                    >
                                                        {submittingReply ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                发送中...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="w-4 h-4 mr-2" />
                                                                {donation.reply_content ? '更新回复' : '发送回复'}
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </main>
    );
}
