'use client';

import { useState } from 'react';
import DonationForm from './donation-form';
import { CreatorCard } from './creator-card';
import type { SiteConfig } from '@/lib/config';
import { motion } from 'framer-motion';

interface DonationSectionProps {
    config: SiteConfig;
}

export function DonationSection({ config }: DonationSectionProps) {
    const [paymentMethod, setPaymentMethod] = useState('wechat');

    return (
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12 items-start">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <DonationForm
                    config={config}
                    onPaymentMethodChange={setPaymentMethod}
                />
            </motion.div>

            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <CreatorCard
                    config={config}
                    selectedPaymentMethod={paymentMethod}
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20"
                >
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">{config.reasons_title}</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        {config.reasons_items.map((reason: string, index: number) => (
                            <li key={index} className="flex gap-2 items-center">
                                <span className="text-green-500 bg-green-50 rounded-full p-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <span>{reason}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="bg-blue-50/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100"
                >
                    <h3 className="font-semibold text-lg mb-3 text-blue-900">{config.security_title}</h3>
                    <p className="text-sm text-blue-800/80 leading-relaxed">
                        {config.security_description}
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
