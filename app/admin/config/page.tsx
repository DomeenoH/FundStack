'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RotateCcw, Settings, Eye, LayoutTemplate, User, CreditCard, FileText, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import type { SiteConfig, PaymentMethod } from '@/lib/config';
import { CreatorCard } from '@/components/creator-card';
import DonationForm from '@/components/donation-form';
import { SiteHeaderPreview } from '@/components/site-header-preview';
import { cn } from '@/lib/utils';

export default function ConfigManagementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [config, setConfig] = useState<Partial<SiteConfig>>({});
    const [activeTab, setActiveTab] = useState('site');

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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Cast config to SiteConfig for preview components, providing defaults where necessary
    const previewConfig = config as SiteConfig;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-20 px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
                        <RotateCcw className="w-5 h-5 text-gray-500" />
                    </Button>
                    <div className="h-6 w-px bg-gray-200" />
                    <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-600" />
                        站点配置
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleReset} disabled={saving} size="sm">
                        重置更改
                    </Button>
                    <Button onClick={handleSave} disabled={saving} size="sm" className="bg-blue-600 hover:bg-blue-700">
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
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Configuration Form */}
                <div className="w-full lg:w-1/2 xl:w-5/12 overflow-y-auto border-r bg-white p-6 pb-24">
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

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4 p-1 bg-slate-100/80">
                            <TabsTrigger value="site" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <LayoutTemplate className="w-4 h-4 mr-2" />
                                网站
                            </TabsTrigger>
                            <TabsTrigger value="creator" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <User className="w-4 h-4 mr-2" />
                                创作者
                            </TabsTrigger>
                            <TabsTrigger value="form" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <CreditCard className="w-4 h-4 mr-2" />
                                表单
                            </TabsTrigger>
                            <TabsTrigger value="email" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Mail className="w-4 h-4 mr-2" />
                                邮件
                            </TabsTrigger>
                            <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <FileText className="w-4 h-4 mr-2" />
                                内容
                            </TabsTrigger>
                        </TabsList>

                        {/* Email Configuration Tab */}
                        <TabsContent value="email" className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label htmlFor="email_enabled">启用邮件通知</Label>
                                    <p className="text-xs text-gray-500">开启后，系统将在收到投喂或回复时发送邮件通知</p>
                                </div>
                                <Switch
                                    id="email_enabled"
                                    checked={config.email_config?.enabled ?? false}
                                    onCheckedChange={(checked) => updateConfig('email_config', { ...config.email_config, enabled: checked })}
                                />
                            </div>

                            {config.email_config?.enabled && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-1">
                                    <div className="space-y-4 border p-4 rounded-lg bg-white">
                                        <h3 className="font-medium text-sm text-gray-900 border-b pb-2 mb-4">SMTP 服务器设置</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="smtp_host">SMTP 主机</Label>
                                                <Input
                                                    id="smtp_host"
                                                    value={config.email_config?.host || ''}
                                                    onChange={(e) => updateConfig('email_config', { ...config.email_config, host: e.target.value })}
                                                    placeholder="smtp.example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="smtp_port">端口</Label>
                                                <Input
                                                    id="smtp_port"
                                                    type="number"
                                                    value={config.email_config?.port || 465}
                                                    onChange={(e) => updateConfig('email_config', { ...config.email_config, port: parseInt(e.target.value) })}
                                                    placeholder="465"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="auth_user">用户名 / 邮箱</Label>
                                                <Input
                                                    id="auth_user"
                                                    value={config.email_config?.auth_user || ''}
                                                    onChange={(e) => updateConfig('email_config', { ...config.email_config, auth_user: e.target.value })}
                                                    placeholder="user@example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="auth_pass">密码 / 授权码</Label>
                                                <Input
                                                    id="auth_pass"
                                                    type="password"
                                                    value={config.email_config?.auth_pass || ''}
                                                    onChange={(e) => updateConfig('email_config', { ...config.email_config, auth_pass: e.target.value })}
                                                    placeholder="********"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="from_name">发件人名称</Label>
                                                <Input
                                                    id="from_name"
                                                    value={config.email_config?.from_name || ''}
                                                    onChange={(e) => updateConfig('email_config', { ...config.email_config, from_name: e.target.value })}
                                                    placeholder="投喂小站"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="from_email">发件人邮箱</Label>
                                                <Input
                                                    id="from_email"
                                                    value={config.email_config?.from_email || ''}
                                                    onChange={(e) => updateConfig('email_config', { ...config.email_config, from_email: e.target.value })}
                                                    placeholder="noreply@example.com"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2 pt-8">
                                                <Switch
                                                    id="smtp_secure"
                                                    checked={config.email_config?.secure ?? true}
                                                    onCheckedChange={(checked) => updateConfig('email_config', { ...config.email_config, secure: checked })}
                                                />
                                                <Label htmlFor="smtp_secure">启用 SSL/TLS</Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-medium text-sm text-gray-900">邮件模板设置</h3>
                                        <Tabs defaultValue="notification" className="w-full">
                                            <TabsList className="w-full justify-start">
                                                <TabsTrigger value="notification">新投喂通知 (给站长)</TabsTrigger>
                                                <TabsTrigger value="confirmation">投喂成功 (给用户)</TabsTrigger>
                                                <TabsTrigger value="reply">收到回复 (给用户)</TabsTrigger>
                                            </TabsList>

                                            {['notification', 'confirmation', 'reply'].map((type) => {
                                                const templateKey = `donation_${type}`;
                                                // @ts-ignore
                                                const template = config.email_config?.templates?.[templateKey] || {};

                                                return (
                                                    <TabsContent key={type} value={type} className="space-y-4 border p-4 rounded-lg bg-white mt-2">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="space-y-0.5">
                                                                <Label>启用此模板</Label>
                                                                <p className="text-xs text-gray-500">是否发送此类邮件</p>
                                                            </div>
                                                            <Switch
                                                                checked={template.enabled ?? true}
                                                                onCheckedChange={(checked) => {
                                                                    const newConfig = { ...config.email_config };
                                                                    // @ts-ignore
                                                                    if (!newConfig.templates) newConfig.templates = {};
                                                                    // @ts-ignore
                                                                    if (!newConfig.templates[templateKey]) newConfig.templates[templateKey] = {};
                                                                    // @ts-ignore
                                                                    newConfig.templates[templateKey].enabled = checked;
                                                                    updateConfig('email_config', newConfig);
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>邮件标题</Label>
                                                            <Input
                                                                value={template.subject || ''}
                                                                onChange={(e) => {
                                                                    const newConfig = { ...config.email_config };
                                                                    // @ts-ignore
                                                                    if (!newConfig.templates) newConfig.templates = {};
                                                                    // @ts-ignore
                                                                    if (!newConfig.templates[templateKey]) newConfig.templates[templateKey] = {};
                                                                    // @ts-ignore
                                                                    newConfig.templates[templateKey].subject = e.target.value;
                                                                    updateConfig('email_config', newConfig);
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>邮件内容 (支持 HTML)</Label>
                                                            <Textarea
                                                                value={template.body || ''}
                                                                onChange={(e) => {
                                                                    const newConfig = { ...config.email_config };
                                                                    // @ts-ignore
                                                                    if (!newConfig.templates) newConfig.templates = {};
                                                                    // @ts-ignore
                                                                    if (!newConfig.templates[templateKey]) newConfig.templates[templateKey] = {};
                                                                    // @ts-ignore
                                                                    newConfig.templates[templateKey].body = e.target.value;
                                                                    updateConfig('email_config', newConfig);
                                                                }}
                                                                rows={8}
                                                                className="font-mono text-sm"
                                                            />
                                                            <div className="text-xs text-gray-500 space-x-2">
                                                                <span>可用变量:</span>
                                                                <code className="bg-gray-100 px-1 rounded">{'{user_name}'}</code>
                                                                <code className="bg-gray-100 px-1 rounded">{'{amount}'}</code>
                                                                <code className="bg-gray-100 px-1 rounded">{'{user_message}'}</code>
                                                                {type === 'reply' && <code className="bg-gray-100 px-1 rounded">{'{reply_content}'}</code>}
                                                            </div>
                                                        </div>
                                                    </TabsContent>
                                                );
                                            })}
                                        </Tabs>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* Site Information Tab */}
                        <TabsContent value="site" className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">基本信息</h2>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">SEO & Header</span>
                                </div>

                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="site_title">网站标题</Label>
                                        <Input
                                            id="site_title"
                                            value={config.site_title || ''}
                                            onChange={(e) => updateConfig('site_title', e.target.value)}
                                            placeholder="投喂小站"
                                        />
                                        <p className="text-xs text-gray-500">显示在浏览器标签页和导航栏左侧</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="site_description">网站描述 (Meta)</Label>
                                        <Textarea
                                            id="site_description"
                                            value={config.site_description || ''}
                                            onChange={(e) => updateConfig('site_description', e.target.value)}
                                            rows={2}
                                            placeholder="用于SEO搜索引擎抓取的描述信息"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h2 className="text-lg font-semibold">Hero 区域</h2>
                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-slate-50">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="site_hero_emoji_visible">显示装饰元素</Label>
                                            <p className="text-xs text-gray-500">在主标题上方显示一个装饰性的 Emoji 或图片</p>
                                        </div>
                                        <Switch
                                            id="site_hero_emoji_visible"
                                            checked={config.site_hero_emoji_visible ?? true}
                                            onCheckedChange={(checked) => updateConfig('site_hero_emoji_visible', checked)}
                                        />
                                    </div>

                                    {config.site_hero_emoji_visible && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-1 border p-4 rounded-lg bg-slate-50">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>类型</Label>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            variant={config.site_hero_content_type === 'emoji' ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => updateConfig('site_hero_content_type', 'emoji')}
                                                            className="flex-1"
                                                        >
                                                            Emoji
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant={config.site_hero_content_type === 'image' ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => updateConfig('site_hero_content_type', 'image')}
                                                            className="flex-1"
                                                        >
                                                            图片
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="site_hero_content">
                                                        {config.site_hero_content_type === 'image' ? '图片地址' : 'Emoji 字符'}
                                                    </Label>
                                                    <Input
                                                        id="site_hero_content"
                                                        value={config.site_hero_content || (config.site_hero_content_type === 'image' ? '' : '❤️')}
                                                        onChange={(e) => updateConfig('site_hero_content', e.target.value)}
                                                        placeholder={config.site_hero_content_type === 'image' ? 'https://... or /images/...' : 'e.g. ❤️'}
                                                        className={config.site_hero_content_type === 'emoji' ? 'font-emoji text-lg' : ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="site_heading">主标题</Label>
                                        <Input
                                            id="site_heading"
                                            value={config.site_heading || ''}
                                            onChange={(e) => updateConfig('site_heading', e.target.value)}
                                            placeholder="感谢你的支持"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="site_subheading">副标题</Label>
                                        <Textarea
                                            id="site_subheading"
                                            value={config.site_subheading || ''}
                                            onChange={(e) => updateConfig('site_subheading', e.target.value)}
                                            rows={3}
                                            placeholder="显示在主标题下方的欢迎语或说明文字"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h2 className="text-lg font-semibold">页脚设置</h2>
                                <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-slate-50">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="footer_enabled">显示页脚</Label>
                                        <p className="text-xs text-gray-500">在页面底部显示版权、运行时间等信息</p>
                                    </div>
                                    <Switch
                                        id="footer_enabled"
                                        checked={config.footer?.enabled ?? true}
                                        onCheckedChange={(checked) => updateConfig('footer', { ...config.footer, enabled: checked })}
                                    />
                                </div>

                                {config.footer?.enabled && (
                                    <div className="grid gap-4 animate-in fade-in slide-in-from-top-1 border p-4 rounded-lg bg-slate-50">
                                        <div className="space-y-2">
                                            <Label htmlFor="footer_text">自定义文本</Label>
                                            <Input
                                                id="footer_text"
                                                value={config.footer?.text || ''}
                                                onChange={(e) => updateConfig('footer', { ...config.footer, text: e.target.value })}
                                                placeholder="Powered by v0-hexo-donate"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center justify-between border p-3 rounded bg-white">
                                                <Label htmlFor="footer_copyright" className="text-sm cursor-pointer">显示版权信息</Label>
                                                <Switch
                                                    id="footer_copyright"
                                                    checked={config.footer?.show_copyright ?? true}
                                                    onCheckedChange={(checked) => updateConfig('footer', { ...config.footer, show_copyright: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between border p-3 rounded bg-white">
                                                <Label htmlFor="footer_runtime" className="text-sm cursor-pointer">显示运行时间</Label>
                                                <Switch
                                                    id="footer_runtime"
                                                    checked={config.footer?.show_runtime ?? true}
                                                    onCheckedChange={(checked) => updateConfig('footer', { ...config.footer, show_runtime: checked })}
                                                />
                                            </div>
                                        </div>
                                        {config.footer?.show_runtime && (
                                            <div className="space-y-2">
                                                <Label htmlFor="footer_start_date">站点启动日期</Label>
                                                <Input
                                                    id="footer_start_date"
                                                    type="date"
                                                    value={config.footer?.start_date || ''}
                                                    onChange={(e) => updateConfig('footer', { ...config.footer, start_date: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Creator Information Tab */}
                        <TabsContent value="creator" className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold">个人资料</h2>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="creator_name">创作者名称</Label>
                                        <Input
                                            id="creator_name"
                                            value={config.creator_name || ''}
                                            onChange={(e) => updateConfig('creator_name', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="creator_role">角色/头衔</Label>
                                        <Input
                                            id="creator_role"
                                            value={config.creator_role || ''}
                                            onChange={(e) => updateConfig('creator_role', e.target.value)}
                                            placeholder="e.g. 独立开发者 / 设计师"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="creator_description">个人简介</Label>
                                        <Textarea
                                            id="creator_description"
                                            value={config.creator_description || ''}
                                            onChange={(e) => updateConfig('creator_description', e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h2 className="text-lg font-semibold">头像与收款码</h2>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="creator_qq_number">QQ号 (推荐)</Label>
                                        <Input
                                            id="creator_qq_number"
                                            value={config.creator_qq_number || ''}
                                            onChange={(e) => updateConfig('creator_qq_number', e.target.value)}
                                            placeholder="输入QQ号自动获取头像"
                                        />
                                        <p className="text-xs text-gray-500">填写QQ号可自动获取高清头像，无需手动上传</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="creator_avatar">自定义头像路径 (可选)</Label>
                                        <Input
                                            id="creator_avatar"
                                            value={config.creator_avatar || ''}
                                            onChange={(e) => updateConfig('creator_avatar', e.target.value)}
                                            placeholder="/placeholder-user.jpg"
                                        />
                                    </div>

                                    <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                                        <h3 className="font-medium text-sm text-gray-900">头像角标设置</h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>类型</Label>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant={config.creator_avatar_badge_type === 'emoji' ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => updateConfig('creator_avatar_badge_type', 'emoji')}
                                                        className="flex-1"
                                                    >
                                                        Emoji
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={config.creator_avatar_badge_type === 'image' ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => updateConfig('creator_avatar_badge_type', 'image')}
                                                        className="flex-1"
                                                    >
                                                        图片
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="creator_avatar_badge_content">
                                                    {config.creator_avatar_badge_type === 'image' ? '图片地址' : 'Emoji 字符'}
                                                </Label>
                                                <Input
                                                    id="creator_avatar_badge_content"
                                                    value={config.creator_avatar_badge_content || (config.creator_avatar_badge_type === 'image' ? '' : '⚡')}
                                                    onChange={(e) => updateConfig('creator_avatar_badge_content', e.target.value)}
                                                    placeholder={config.creator_avatar_badge_type === 'image' ? 'https://...' : 'e.g. ⚡'}
                                                    className={config.creator_avatar_badge_type === 'emoji' ? 'font-emoji text-lg' : ''}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="creator_avatar_badge_bg_visible" className="cursor-pointer">显示背景色</Label>
                                            <Switch
                                                id="creator_avatar_badge_bg_visible"
                                                checked={config.creator_avatar_badge_bg_visible ?? true}
                                                onCheckedChange={(checked) => updateConfig('creator_avatar_badge_bg_visible', checked)}
                                            />
                                        </div>

                                        {config.creator_avatar_badge_bg_visible && (
                                            <div className="space-y-2">
                                                <Label htmlFor="creator_avatar_badge_bg_color">背景颜色</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="creator_avatar_badge_bg_color"
                                                        type="color"
                                                        value={config.creator_avatar_badge_bg_color || '#3b82f6'}
                                                        onChange={(e) => updateConfig('creator_avatar_badge_bg_color', e.target.value)}
                                                        className="w-12 h-10 p-1 cursor-pointer"
                                                    />
                                                    <Input
                                                        value={config.creator_avatar_badge_bg_color || '#3b82f6'}
                                                        onChange={(e) => updateConfig('creator_avatar_badge_bg_color', e.target.value)}
                                                        className="flex-1 font-mono uppercase"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="payment_alipay_qr">支付宝收款码</Label>
                                            <Input
                                                id="payment_alipay_qr"
                                                value={config.payment_alipay_qr || ''}
                                                onChange={(e) => updateConfig('payment_alipay_qr', e.target.value)}
                                                placeholder="/alipay-qr.png"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="payment_wechat_qr">微信收款码</Label>
                                            <Input
                                                id="payment_wechat_qr"
                                                value={config.payment_wechat_qr || ''}
                                                onChange={(e) => updateConfig('payment_wechat_qr', e.target.value)}
                                                placeholder="/wechat-qr.png"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Form Configuration Tab */}
                        <TabsContent value="form" className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold">表单设置</h2>
                                <div className="grid gap-4">
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
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h2 className="text-lg font-semibold">限制与规则</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="form_amount_min">最小金额</Label>
                                        <Input
                                            id="form_amount_min"
                                            type="number"
                                            step="0.01"
                                            value={config.form_amount_min || 0.01}
                                            onChange={(e) => updateConfig('form_amount_min', parseFloat(e.target.value))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="form_amount_max">最大金额</Label>
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
                                        <Label htmlFor="form_name_max_length">昵称长度限制</Label>
                                        <Input
                                            id="form_name_max_length"
                                            type="number"
                                            value={config.form_name_max_length || 50}
                                            onChange={(e) => updateConfig('form_name_max_length', parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="form_message_max_length">留言长度限制</Label>
                                        <Input
                                            id="form_message_max_length"
                                            type="number"
                                            value={config.form_message_max_length || 500}
                                            onChange={(e) => updateConfig('form_message_max_length', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label>投喂提示语 (随机显示)</Label>
                                    {((config.donation_tips || []) as string[]).map((tip, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={tip}
                                                onChange={(e) => {
                                                    const tips = [...((config.donation_tips || []) as string[])];
                                                    tips[index] = e.target.value;
                                                    updateConfig('donation_tips', tips);
                                                }}
                                                placeholder={`提示语 ${index + 1}`}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => {
                                                    const tips = [...((config.donation_tips || []) as string[])];
                                                    tips.splice(index, 1);
                                                    updateConfig('donation_tips', tips);
                                                }}
                                            >
                                                <span className="sr-only">删除</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2" /></svg>
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const tips = (config.donation_tips || []) as string[];
                                            updateConfig('donation_tips', [...tips, '']);
                                        }}
                                        className="w-full border-dashed"
                                    >
                                        + 添加提示语
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h2 className="text-lg font-semibold">隐私与说明</h2>
                                <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-slate-50">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="form_privacy_visible">显示隐私说明</Label>
                                        <p className="text-xs text-gray-500">在表单底部显示隐私相关的提示文字</p>
                                    </div>
                                    <Switch
                                        id="form_privacy_visible"
                                        checked={config.form_privacy_visible ?? true}
                                        onCheckedChange={(checked) => updateConfig('form_privacy_visible', checked)}
                                    />
                                </div>

                                {config.form_privacy_visible && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                        <Label htmlFor="form_privacy_text">隐私说明内容</Label>
                                        <Textarea
                                            id="form_privacy_text"
                                            value={config.form_privacy_text || ''}
                                            onChange={(e) => updateConfig('form_privacy_text', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Content Configuration Tab */}
                        <TabsContent value="content" className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold">投喂理由</h2>
                                <div className="space-y-2">
                                    <Label htmlFor="reasons_title">板块标题</Label>
                                    <Input
                                        id="reasons_title"
                                        value={config.reasons_title || ''}
                                        onChange={(e) => updateConfig('reasons_title', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label>理由列表</Label>
                                    {((config.reasons_items || []) as string[]).map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={item}
                                                onChange={(e) => updateReasonItem(index, e.target.value)}
                                                placeholder={`理由 ${index + 1}`}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => removeReasonItem(index)}
                                            >
                                                <span className="sr-only">删除</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2" /></svg>
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addReasonItem} className="w-full border-dashed">
                                        + 添加理由
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h2 className="text-lg font-semibold">安全说明</h2>
                                <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-slate-50">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="security_visible">显示安全说明</Label>
                                        <p className="text-xs text-gray-500">在首页底部显示防诈骗等安全提示</p>
                                    </div>
                                    <Switch
                                        id="security_visible"
                                        checked={config.security_visible ?? true}
                                        onCheckedChange={(checked) => updateConfig('security_visible', checked)}
                                    />
                                </div>

                                {config.security_visible && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                        <div className="space-y-2">
                                            <Label htmlFor="security_title">标题</Label>
                                            <Input
                                                id="security_title"
                                                value={config.security_title || ''}
                                                onChange={(e) => updateConfig('security_title', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="security_description">内容</Label>
                                            <Textarea
                                                id="security_description"
                                                value={config.security_description || ''}
                                                onChange={(e) => updateConfig('security_description', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Panel: Live Preview */}
                <div className="hidden lg:block lg:w-1/2 xl:w-7/12 bg-slate-100 p-8 overflow-y-auto relative">
                    <div className="max-w-md mx-auto sticky top-8">
                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 font-medium uppercase tracking-wider">
                            <Eye className="w-4 h-4" />
                            实时预览
                        </div>

                        {activeTab === 'site' && (
                            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                                <SiteHeaderPreview config={previewConfig} />
                                <div className="text-center text-sm text-gray-400">
                                    此处仅预览 Header 和 Hero 区域，更多内容请切换其他标签页
                                </div>
                            </div>
                        )}

                        {activeTab === 'creator' && (
                            <div className="min-h-[650px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-300 pb-12">
                                <div className="w-full max-w-[380px]">
                                    <CreatorCard config={previewConfig} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'form' && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <DonationForm config={previewConfig} />
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <Card className="p-6">
                                    <h3 className="text-lg font-bold mb-4 text-center">{config.reasons_title || '为什么投喂?'}</h3>
                                    <div className="space-y-2">
                                        {((config.reasons_items || []) as string[]).map((item, i) => (
                                            <div key={i} className="p-3 bg-slate-50 rounded-lg text-sm text-gray-600 text-center">
                                                {item}
                                            </div>
                                        ))}
                                        {(!config.reasons_items || config.reasons_items.length === 0) && (
                                            <div className="text-center text-gray-400 italic text-sm">暂无理由</div>
                                        )}
                                    </div>
                                </Card>

                                {config.security_visible && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                        <h4 className="font-semibold text-blue-900 text-sm mb-1">{config.security_title}</h4>
                                        <p className="text-xs text-blue-700">{config.security_description}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
