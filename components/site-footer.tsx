'use client';

import { useEffect, useState } from 'react';
import { SiteConfig } from '@/lib/config';

interface SiteFooterProps {
    config: SiteConfig;
}

export function SiteFooter({ config }: SiteFooterProps) {
    const [runtime, setRuntime] = useState<string>('');

    useEffect(() => {
        if (!config.footer?.show_runtime || !config.footer.start_date) return;

        const startDate = new Date(config.footer.start_date);

        const updateRuntime = () => {
            const now = new Date();
            const diff = now.getTime() - startDate.getTime();

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setRuntime(`${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`);
        };

        updateRuntime();
        const timer = setInterval(updateRuntime, 1000);

        return () => clearInterval(timer);
    }, [config.footer?.show_runtime, config.footer?.start_date]);

    if (!config.footer?.enabled) return null;

    return (
        <footer className="py-8 text-center text-sm text-gray-500 space-y-2">
            {config.footer.text ? (
                <p>{config.footer.text}</p>
            ) : (
                <p>
                    Powered by{' '}
                    <a
                        href="https://github.com/DomeenoH/v0-hexo-donate-refactor"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-700 underline transition-colors"
                    >
                        FundStack
                    </a>
                </p>
            )}

            {config.footer.show_copyright && (
                <p>&copy; {new Date().getFullYear()} {config.site_title || '投喂小站'}. All rights reserved.</p>
            )}

            {config.footer.show_runtime && runtime && (
                <p className="text-xs text-gray-400">
                    已安全运行 {runtime}
                </p>
            )}
        </footer>
    );
}
