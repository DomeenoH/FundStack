import DonationForm from '@/components/donation-form';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export const metadata = {
  title: 'Support Us - Donation Platform',
  description: 'Support our work with a donation. Fast, secure, and simple.',
};

export default function DonationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Support Our Mission</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your generous donation helps us continue creating quality content and maintaining our services.
            Thank you for being part of our community!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          <div>
            <DonationForm />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Why Donate?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Support quality content creation</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Help maintain our servers</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Enable new features and improvements</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Join our community of supporters</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-lg mb-3">Secure & Private</h3>
              <p className="text-sm text-gray-700">
                Your payment information is processed securely. We never store sensitive payment data and only collect necessary information for donation tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Recent Donations</h2>
          <div className="dynamic-list-content" id="donation-list-mount">
            {/* Client-side donation list will be loaded here */}
          </div>
        </div>
      </div>
    </main>
  );
}
