'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RotateCcw, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SiteConfig, PaymentMethod } from '@/lib/config';

export default function ConfigManagementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [config, setConfig] = useState<Partial<SiteConfig>>({});

    // Load configuration on mount
    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                router.push('/admin');
                return;
            }

            const response = await fetch('/api/admin/config', {
                headers: {
                    Authorization: `Basic ${token}`,
                },
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to load configuration');
            }

            const data = await response.json();
            setConfig(data.data || {});
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                router.push('/admin');
                return;
            }

            const response = await fetch('/api/admin/config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${token}`,
                },
                body: JSON.stringify({ updates: config }),
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to save configuration');
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('确定要重置所有配置吗?这将恢复到上次保存的状态。')) {
            loadConfig();
        }
    };

    const updateConfig = (key: keyof SiteConfig, value: any) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const addPaymentMethod = () => {
        const methods = (config.payment_methods || []) as PaymentMethod[];
        updateConfig('payment_methods', [
            ...methods,
            { value: '', label: '' },
        ]);
    };

    const updatePaymentMethod = (index: number, field: 'value' | 'label', value: string) => {
        const methods = [...((config.payment_methods || []) as PaymentMethod[])];
        methods[index] = { ...methods[index], [field]: value };
        updateConfig('payment_methods', methods);
    };

    const removePaymentMethod = (index: number) => {
        const methods = [...((config.payment_methods || []) as PaymentMethod[])];
        methods.splice(index, 1);
        updateConfig('payment_methods', methods);
    };

    const updateReasonItem = (index: number, value: string) => {
        const items = [...((config.reasons_items || []) as string[])];
        items[index] = value;
        updateConfig('reasons_items', items);
    };

    const addReasonItem = () => {
        const items = (config.reasons_items || []) as string[];
        updateConfig('reasons_items', [...items, '']);
    };

    const removeReasonItem = (index: number) => {
        const items = [...((config.reasons_items || []) as string[])];
        items.splice(index, 1);
        updateConfig('reasons_items', items);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold">站点配置管理</h1>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleReset} disabled={saving}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            重置
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    保存中...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    保存配置
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {error && (
                    <Alert className="mb-6 bg-red-50 border-red-200">
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-6 bg-green-50 border-green-200">
                        <AlertDescription className="text-green-800">配置保存成功!</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="site" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="site">网站信息</TabsTrigger>
                        <TabsTrigger value="creator">创作者信息</TabsTrigger>
                        <TabsTrigger value="form">表单配置</TabsTrigger>
                        <TabsTrigger value="content">内容配置</TabsTrigger>
                    </TabsList>

                    {/* Site Information Tab */}
                    <TabsContent value="site">
                        <Card className="p-6 space-y-4">
                            <h2 className="text-xl font-semibold mb-4">网站基本信息</h2>

                            <div className="space-y-2">
                                <Label htmlFor="site_title">网站标题</Label>
                                <Input
                                    id="site_title"
                                    value={config.site_title || ''}
                                    onChange={(e) => updateConfig('site_title', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="site_description">网站描述</Label>
                                <Input
                                    id="site_description"
                                    value={config.site_description || ''}
                                    onChange={(e) => updateConfig('site_description', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="site_heading">页面主标题</Label>
                                <Input
                                    id="site_heading"
                                    value={config.site_heading || ''}
                                    onChange={(e) => updateConfig('site_heading', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="site_subheading">页面副标题</Label>
                                <Textarea
                                    id="site_subheading"
                                    value={config.site_subheading || ''}
                                    onChange={(e) => updateConfig('site_subheading', e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Creator Information Tab */}
                    <TabsContent value="creator">
                        <Card className="p-6 space-y-4">
                            <h2 className="text-xl font-semibold mb-4">创作者信息</h2>

                            <div className="space-y-2">
                                <Label htmlFor="creator_name">创作者名称</Label>
                                <Input
                                    id="creator_name"
                                    value={config.creator_name || ''}
                                    onChange={(e) => updateConfig('creator_name', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="creator_role">创作者角色</Label>
                                <Input
                                    id="creator_role"
                                    value={config.creator_role || ''}
                                    onChange={(e) => updateConfig('creator_role', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="creator_description">创作者描述</Label>
                                <Textarea
                                    id="creator_description"
                                    value={config.creator_description || ''}
                                    onChange={(e) => updateConfig('creator_description', e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="creator_avatar">创作者头像路径</Label>
                                <Input
                                    id="creator_avatar"
                                    value={config.creator_avatar || ''}
                                    onChange={(e) => updateConfig('creator_avatar', e.target.value)}
                                    placeholder="/placeholder-user.jpg"
                                />
                                <p className="text-xs text-gray-500">请将图片上传到 /public 目录,然后填写相对路径</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_alipay_qr">支付宝收款码路径</Label>
                                <Input
                                    id="payment_alipay_qr"
                                    value={config.payment_alipay_qr || ''}
                                    onChange={(e) => updateConfig('payment_alipay_qr', e.target.value)}
                                    placeholder="/alipay-qr.png"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_wechat_qr">微信收款码路径</Label>
                                <Input
                                    id="payment_wechat_qr"
                                    value={config.payment_wechat_qr || ''}
                                    onChange={(e) => updateConfig('payment_wechat_qr', e.target.value)}
                                    placeholder="/wechat-qr.png"
                                />
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Form Configuration Tab */}
                    <TabsContent value="form">
                        <Card className="p-6 space-y-4">
                            <h2 className="text-xl font-semibold mb-4">表单配置</h2>

                            <div className="space-y-2">
                                <Label htmlFor="form_title">表单标题</Label>
                                <Input
                                    id="form_title"
                                    value={config.form_title || ''}
                                    onChange={(e) => updateConfig('form_title', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="form_description">表单描述</Label>
                                <Textarea
                                    id="form_description"
                                    value={config.form_description || ''}
                                    onChange={(e) => updateConfig('form_description', e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="form_amount_min">最小投喂金额</Label>
                                    <Input
                                        id="form_amount_min"
                                        type="number"
                                        step="0.01"
                                        value={config.form_amount_min || 0.01}
                                        onChange={(e) => updateConfig('form_amount_min', parseFloat(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="form_amount_max">最大投喂金额</Label>
                                    <Input
                                        id="form_amount_max"
                                        type="number"
                                        step="0.01"
                                        value={config.form_amount_max || 99999.99}
                                        onChange={(e) => updateConfig('form_amount_max', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="form_name_max_length">昵称最大长度</Label>
                                    <Input
                                        id="form_name_max_length"
                                        type="number"
                                        value={config.form_name_max_length || 50}
                                        onChange={(e) => updateConfig('form_name_max_length', parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="form_message_max_length">留言最大长度</Label>
                                    <Input
                                        id="form_message_max_length"
                                        type="number"
                                        value={config.form_message_max_length || 500}
                                        onChange={(e) => updateConfig('form_message_max_length', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>支付方式列表</Label>
                                {((config.payment_methods || []) as PaymentMethod[]).map((method, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="值 (例如: wechat)"
                                            value={method.value}
                                            onChange={(e) => updatePaymentMethod(index, 'value', e.target.value)}
                                        />
                                        <Input
                                            placeholder="标签 (例如: 微信支付)"
                                            value={method.label}
                                            onChange={(e) => updatePaymentMethod(index, 'label', e.target.value)}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removePaymentMethod(index)}
                                        >
                                            删除
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addPaymentMethod}>
                                    + 添加支付方式
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="form_privacy_text">隐私说明文字</Label>
                                <Textarea
                                    id="form_privacy_text"
                                    value={config.form_privacy_text || ''}
                                    onChange={(e) => updateConfig('form_privacy_text', e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Content Configuration Tab */}
                    <TabsContent value="content">
                        <Card className="p-6 space-y-4">
                            <h2 className="text-xl font-semibold mb-4">内容配置</h2>

                            <div className="space-y-2">
                                <Label htmlFor="list_home_title">首页列表标题</Label>
                                <Input
                                    id="list_home_title"
                                    value={config.list_home_title || ''}
                                    onChange={(e) => updateConfig('list_home_title', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="list_home_limit">首页显示数量</Label>
                                <Input
                                    id="list_home_limit"
                                    type="number"
                                    value={config.list_home_limit || 5}
                                    onChange={(e) => updateConfig('list_home_limit', parseInt(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reasons_title">投喂理由标题</Label>
                                <Input
                                    id="reasons_title"
                                    value={config.reasons_title || ''}
                                    onChange={(e) => updateConfig('reasons_title', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>投喂理由列表</Label>
                                {((config.reasons_items || []) as string[]).map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={item}
                                            onChange={(e) => updateReasonItem(index, e.target.value)}
                                            placeholder="输入理由"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeReasonItem(index)}
                                        >
                                            删除
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addReasonItem}>
                                    + 添加理由
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="security_title">安全说明标题</Label>
                                <Input
                                    id="security_title"
                                    value={config.security_title || ''}
                                    onChange={(e) => updateConfig('security_title', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="security_description">安全说明描述</Label>
                                <Textarea
                                    id="security_description"
                                    value={config.security_description || ''}
                                    onChange={(e) => updateConfig('security_description', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
