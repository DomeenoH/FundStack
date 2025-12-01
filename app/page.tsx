'use client';

import DonationList, { DonationListRef } from '@/components/donation-list';
import { Heart, Loader2 } from 'lucide-react';
import { DonationSection } from '@/components/donation-section';
import { useEffect, useState, useRef, useMemo } from 'react';
import type { SiteConfig } from '@/lib/config';
import { fetchJson } from '@/lib/api';
import { SiteFooter } from '@/components/site-footer';
import { extractFirstEmoji } from '@/lib/emoji-utils';

export default function DonationPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [subtitle, setSubtitle] = useState('');
  const donationListRef = useRef<DonationListRef>(null);

  useEffect(() => {
    fetchJson<{ success: boolean; data: SiteConfig }>('/api/config')
      .then(response => {
        const data = response.data;
        setConfig(data);

        // Randomly select a subtitle
        if (data.site_subtitles && data.site_subtitles.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.site_subtitles.length);
          setSubtitle(data.site_subtitles[randomIndex]);
        } else {
          setSubtitle(data.site_subheading || '');
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load config:', err);
        setLoading(false);
      });
  }, []);

  // Extract emoji from subtitle and determine display values
  const { displaySubtitle, heroEmoji } = useMemo(() => {
    if (!subtitle || !config?.site_hero_emoji_visible) {
      return {
        displaySubtitle: subtitle,
        heroEmoji: config?.site_hero_content || config?.site_hero_emoji || '❤️'
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
      heroEmoji: config?.site_hero_content || config?.site_hero_emoji || '❤️'
    };
  }, [subtitle, config]);

  const handleSubmitSuccess = () => {
    // Refresh the donation list after successful submission
    if (donationListRef.current) {
      donationListRef.current.refresh();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center">
        <p className="text-red-500">加载配置失败，请刷新页面重试</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 mb-12">
          {config.site_hero_emoji_visible !== false && (
            <div className="inline-block animate-bounce-slow">
              {config.site_hero_content_type === 'image' && config.site_hero_content ? (
                <img
                  src={config.site_hero_content}
                  alt="Hero Decoration"
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <span className="text-6xl filter drop-shadow-lg">
                  {heroEmoji}
                </span>
              )}
            </div>
          )}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{config.site_heading}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {displaySubtitle}
            </p>
          </div>
        </section>

        <DonationSection config={config} onSubmitSuccess={handleSubmitSuccess} />

        <div className="max-w-6xl mx-auto bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{config.list_home_title}</h2>
            {config.list_home_subtitle && (
              <p className="text-gray-500 mt-1">{config.list_home_subtitle}</p>
            )}
          </div>
          <DonationList ref={donationListRef} limit={config.list_home_limit} merge={false} creatorName={config.creator_name} />
        </div>
      </main>
      <SiteFooter config={config} />
    </div>
  );
}
