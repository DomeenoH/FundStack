'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SiteConfig } from '@/lib/config';
import { useMemo } from 'react';
import { extractFirstEmoji } from '@/lib/emoji-utils';

interface SiteHeaderPreviewProps {
    config: SiteConfig;
}

const NAV_LINKS = [
    { label: '投喂首页', active: true },
    { label: '投喂墙', active: false },
    { label: '投喂数据', active: false },
    { label: '管理面板', active: false },
];

export function SiteHeaderPreview({ config }: SiteHeaderPreviewProps) {
    // Get a subtitle to preview (use first one from array or fallback to old field)
    const subtitle = useMemo(() => {
        if (config.site_subtitles && config.site_subtitles.length > 0) {
            return config.site_subtitles[0];
        }
        return config.site_subheading || '每一份投喂都是对我们最大的鼓励，支持我们继续创作更多优质内容。';
    }, [config.site_subtitles, config.site_subheading]);

    // Extract emoji from subtitle if decorative element is visible
    const { displaySubtitle, heroEmoji } = useMemo(() => {
        if (!subtitle || !config.site_hero_emoji_visible) {
            return {
                displaySubtitle: subtitle,
                heroEmoji: config.site_hero_content || config.site_hero_emoji || '❤️'
            };
        }

        const { emoji, textWithoutEmoji } = extractFirstEmoji(subtitle);

        if (emoji) {
            // If subtitle contains emoji and decorative element is visible,
            // use emoji from subtitle as hero emoji and hide it in subtitle
            return {
                displaySubtitle: textWithoutEmoji,
                heroEmoji: emoji
            };
        }

        return {
            displaySubtitle: subtitle,
            heroEmoji: config.site_hero_content || config.site_hero_emoji || '❤️'
        };
    }, [subtitle, config.site_hero_emoji_visible, config.site_hero_content, config.site_hero_emoji]);

    return (
        <div className="w-full bg-white/95 backdrop-blur-lg shadow-sm border-b rounded-t-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
                <span className="font-bold text-lg tracking-tight text-slate-800 shrink-0">
                    {config.site_title || '投喂小站'}
                </span>
                <nav className="relative flex items-center gap-1 text-sm font-medium">
                    {NAV_LINKS.map((link, index) => (
                        <div
                            key={index}
                            className={cn(
                                'relative z-10 rounded-lg px-3 py-2 transition-colors duration-300 whitespace-nowrap cursor-default',
                                link.active
                                    ? 'text-slate-900'
                                    : 'text-slate-600'
                            )}
                        >
                            {link.label}
                            {link.active && (
                                <motion.div
                                    layoutId="preview-nav-pill"
                                    className="absolute inset-0 rounded-lg bg-slate-200/80 shadow-sm -z-10"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Hero Section Preview */}
            <div className="bg-gradient-to-b from-slate-50 to-white px-8 py-12">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-3">
                        {config.site_hero_emoji_visible && (
                            <div className="mb-4 animate-bounce">
                                {config.site_hero_content_type === 'image' && config.site_hero_content ? (
                                    <img
                                        src={config.site_hero_content}
                                        alt="Hero Decoration"
                                        className="w-12 h-12 object-contain mx-auto"
                                    />
                                ) : (
                                    <span className="text-4xl filter drop-shadow-md">
                                        {heroEmoji}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold mb-3 text-gray-900">{config.site_heading || '感谢你的支持'}</h1>
                    <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
                        {displaySubtitle}
                    </p>
                </div>
            </div>
        </div>
    );
}
