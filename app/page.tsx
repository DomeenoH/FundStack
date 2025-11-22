import DonationForm from '@/components/donation-form';
import DonationList from '@/components/donation-list';
import { Heart } from 'lucide-react';
import { CreatorCard } from '@/components/creator-card';
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          <div>
            <DonationForm config={config} />
          </div>
          <div className="space-y-6">
            <CreatorCard config={config} />
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">{config.reasons_title}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {config.reasons_items.map((reason: string, index: number) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-lg mb-3">{config.security_title}</h3>
              <p className="text-sm text-gray-700">
                {config.security_description}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">{config.list_home_title}</h2>
          <DonationList limit={config.list_home_limit} merge={false} />
        </div>
      </div>
    </main>
  );
}
