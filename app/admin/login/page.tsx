'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('password', password);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                window.location.href = '/admin';
            } else {
                const data = await response.json();
                setError(data.error || '登录失败');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('登录失败。请重试。');
        } finally {
            setLoading(false);
        }
    };

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
