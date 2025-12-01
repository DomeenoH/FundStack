'use client';

import DonationList, { DonationListRef } from '@/components/donation-list';
import { Heart, Loader2 } from 'lucide-react';
import { DonationSection } from '@/components/donation-section';
import { useEffect, useState, useRef } from 'react';
import type { SiteConfig } from '@/lib/config';
import { fetchJson } from '@/lib/api';

export default function DonationPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const donationListRef = useRef<DonationListRef>(null);

  useEffect(() => {
    fetchJson<{ success: boolean; data: SiteConfig }>('/api/config')
      .then(response => {
        setConfig(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load config:', err);
        setLoading(false);
      });
  }, []);

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
    <main className="min-h-screen bg-stone-50/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            {config.site_hero_emoji_visible !== false && (
              <span className="text-4xl md:text-5xl animate-bounce">{config.site_hero_emoji || '❤️'}</span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{config.site_heading}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {config.site_subheading}
          </p>
        </div>

        <DonationSection config={config} onSubmitSuccess={handleSubmitSuccess} />

        <div className="max-w-6xl mx-auto bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">{config.list_home_title}</h2>
          <DonationList ref={donationListRef} limit={config.list_home_limit} merge={false} />
        </div>
      </div>
    </main>
  );
}
