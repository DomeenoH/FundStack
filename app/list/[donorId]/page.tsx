'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, User, Calendar, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { fetchJson } from '@/lib/api';
import { getUserAvatarUrl } from '@/lib/avatar-utils';

interface DonationHistoryItem {
    id: number;
    user_name: string;
    user_url?: string;
    amount: number;
    payment_method: string;
    user_message?: string;
    created_at: string;
    status: string;
}

interface DonorDetails {
    id: string;
    user_name: string;
    user_email?: string;
    user_url?: string;
    total_amount: number;
    donation_count: number;
    last_donation_at: string;
}

const PAYMENT_METHOD_LABELS = {
    wechat: '微信',
    alipay: '支付宝',
    qq: 'QQ支付',
    other: '其他',
};

const PAYMENT_METHOD_COLORS = {
    wechat: 'text-green-600',
    alipay: 'text-blue-600',
    qq: 'text-red-600',
    other: 'text-gray-600',
};

export default function DonorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [donor, setDonor] = useState<DonorDetails | null>(null);
    const [history, setHistory] = useState<DonationHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchJson<{ donor: DonorDetails; history: DonationHistoryItem[] }>(
                    `/api/donations/${params.donorId}`
                );
                setDonor(data.donor);
                setHistory(data.history);
            } catch (err) {
                console.error('Failed to fetch donor details:', err);
                setError('加载投喂详情失败');
            } finally {
                setLoading(false);
            }
        };

        if (params.donorId) {
            loadData();
        }
    }, [params.donorId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !donor) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">{error || '找不到该投喂者信息'}</p>
                <Link href="/list" className="text-blue-600 hover:underline">
                    返回投喂墙
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 py-12">
                <Link href="/list" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    返回投喂墙
                </Link>

                <div className="mb-8 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden bg-white">
                        <img
                            src={getUserAvatarUrl(donor.user_email, 80)}
                            alt={donor.user_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            {donor.user_name} 的投喂记录
                        </h1>
                        {donor.user_url && (
                            <a
                                href={donor.user_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                                <User className="w-4 h-4" />
                                访问主页
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                        <p className="text-sm text-gray-600 mb-1">累计投喂金额</p>
                        <p className="text-3xl font-bold text-green-600">¥{donor.total_amount.toFixed(2)}</p>
                    </Card>
                    <Card className="p-6">
                        <p className="text-sm text-gray-600 mb-1">累计投喂次数</p>
                        <p className="text-3xl font-bold text-blue-600">{donor.donation_count} 次</p>
                    </Card>
                    <Card className="p-6">
                        <p className="text-sm text-gray-600 mb-1">最近投喂时间</p>
                        <p className="text-xl font-medium mt-1">
                            {new Date(donor.last_donation_at).toLocaleString('zh-CN')}
                        </p>
                    </Card>
                </div>

                <Card className="overflow-hidden">
                    <div className="p-6 border-b bg-white">
                        <h2 className="text-xl font-bold">详细记录</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">时间</th>
                                    <th className="px-6 py-3 text-left font-medium">方式</th>
                                    <th className="px-6 py-3 text-right font-medium">金额</th>
                                    <th className="px-6 py-3 text-left font-medium">留言</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y bg-white">
                                {history.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(item.created_at).toLocaleString('zh-CN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-gray-400" />
                                                <span className={PAYMENT_METHOD_COLORS[item.payment_method as keyof typeof PAYMENT_METHOD_COLORS]}>
                                                    {PAYMENT_METHOD_LABELS[item.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || item.payment_method}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            ¥{item.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {item.user_message || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </main>
    );
}
