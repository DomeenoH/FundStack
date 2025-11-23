import DonationList from '@/components/donation-list';
import { Heart } from 'lucide-react';
import { DonationSection } from '@/components/donation-section';
import { getConfig } from '@/lib/config';

export async function generateMetadata() {
  const config = await getConfig();
  return {
    title: config.site_title,
    description: config.site_description,
  };
}

export default async function DonationPage() {
  const config = await getConfig();

  return (
    <main className="min-h-screen bg-stone-50/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{config.site_heading}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {config.site_subheading}
          </p>
        </div>

        <DonationSection config={config} />

        <div className="max-w-6xl mx-auto bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">{config.list_home_title}</h2>
          <DonationList limit={config.list_home_limit} merge={true} />
        </div>
      </div>
    </main>
  );
}
