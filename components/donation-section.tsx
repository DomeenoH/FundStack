'use client';

import { useState } from 'react';
import DonationForm from './donation-form';
import { CreatorCard } from './creator-card';
import type { SiteConfig } from '@/lib/config-shared';
import { motion } from 'framer-motion';

interface DonationSectionProps {
    config: SiteConfig;
    onSubmitSuccess?: () => void;
}

export function DonationSection({ config, onSubmitSuccess }: DonationSectionProps) {
    const [paymentMethod, setPaymentMethod] = useState('wechat');

    return (
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12 items-stretch">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="h-full"
            >
                <DonationForm
                    config={config}
                    onPaymentMethodChange={setPaymentMethod}
                    onSubmitSuccess={onSubmitSuccess}
                />
            </motion.div>

            <div className="flex flex-col gap-6 h-full">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                    className="flex-1"
                >
                    <CreatorCard
                        config={config}
                        selectedPaymentMethod={paymentMethod}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                    className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20"
                >
                    <h3 className="font-bold text-lg mb-4 text-gray-900 tracking-tight">{config.reasons_title}</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        {config.reasons_items.map((reason: string, index: number) => (
                            <li key={index} className="flex gap-3 items-start">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-0.5 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <span className="leading-relaxed">{reason}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {config.security_visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
                        className="bg-blue-50/50 backdrop-blur-xl rounded-3xl p-8 border border-blue-100/50"
                    >
                        <h3 className="font-bold text-lg mb-3 text-blue-900 tracking-tight">{config.security_title}</h3>
                        <p className="text-sm text-blue-800/80 leading-relaxed">
                            {config.security_description}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
