/**
 * Site Configuration Management
 * Provides type-safe access to site configuration with caching and defaults
 */

import { getSiteConfig } from './db';
import {
    type SiteConfig,
    type PaymentMethod,
    type EmailConfig,
    type EmailTemplate,
    DEFAULT_CONFIG
} from './config-shared';

export type { SiteConfig, PaymentMethod, EmailConfig, EmailTemplate };
export { DEFAULT_CONFIG };

// Simple in-memory cache
let configCache: SiteConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Get site configuration with caching
 * Server-side only
 */
export async function getConfig(): Promise<SiteConfig> {
    const now = Date.now();

    // Return cached config if still valid
    if (configCache && now - cacheTimestamp < CACHE_TTL) {
        return configCache;
    }

    try {
        const rawConfig = await getSiteConfig();

        // Merge with defaults to ensure all fields exist
        const config: SiteConfig = {
            ...DEFAULT_CONFIG,
            ...rawConfig,
        };

        // Backward compatibility: If site_subtitles is empty but site_subheading exists, use it
        if ((!config.site_subtitles || config.site_subtitles.length === 0) && config.site_subheading) {
            config.site_subtitles = [config.site_subheading];
        }

        // Update cache
        configCache = config;
        cacheTimestamp = now;

        return config;
    } catch (error) {
        console.error('[投喂小站] Error loading site config:', error);
        return DEFAULT_CONFIG;
    }
}

/**
 * Clear configuration cache
 * Call this after updating config
 */
export function clearConfigCache() {
    configCache = null;
    cacheTimestamp = 0;
}

/**
 * Get specific config value with type safety
 */
export async function getConfigValue<K extends keyof SiteConfig>(
    key: K
): Promise<SiteConfig[K]> {
    const config = await getConfig();
    return config[key];
}
