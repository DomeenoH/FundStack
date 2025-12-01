/**
 * Site Configuration Management
 * Provides type-safe access to site configuration with caching and defaults
 */

import { getSiteConfig } from './db';

// Configuration type definitions
export interface PaymentMethod {
    value: string;
    label: string;
}

export interface SiteConfig {
    // Site basic information
    site_title: string;
    site_description: string;
    site_heading: string;
    site_subheading: string;

    // Creator information
    creator_name: string;
    creator_role: string;
    creator_description: string;
    creator_avatar: string;
    creator_avatar_badge?: string;
    creator_avatar_badge_bg_visible?: boolean;
    creator_avatar_badge_bg_color?: string;
    creator_avatar_badge_type?: 'emoji' | 'image';
    creator_avatar_badge_content?: string;
    creator_qq_number?: string;
    payment_alipay_qr: string;
    payment_wechat_qr: string;
    payment_qq_number?: string;

    // Donation form configuration
    form_title: string;
    form_description: string;
    form_amount_min: number;
    form_amount_max: number;
    form_message_max_length: number;
    form_name_max_length: number;
    form_success_message: string;
    donation_tips?: string[];

    // Payment methods
    payment_methods: PaymentMethod[];

    // List display configuration
    list_home_limit: number;
    list_home_title: string;

    // Reasons section
    reasons_title: string;
    reasons_items: string[];

    // Security section
    security_title: string;
    security_description: string;
    security_visible: boolean;

    // Hero section emoji
    site_hero_emoji: string;
    site_hero_emoji_visible: boolean;
    site_hero_content_type?: 'emoji' | 'image';
    site_hero_content?: string;

    // Footer configuration
    footer?: {
        enabled: boolean;
        text: string;
        show_copyright: boolean;
        show_runtime: boolean;
        start_date: string;
    };

    // Other text
    form_privacy_text: string;
    form_privacy_visible: boolean;
    payment_methods_button_text: string;
    payment_methods_button_text_close: string;
    payment_methods_description: string;

    // Email Configuration
    email_config?: EmailConfig;
}

export interface EmailTemplate {
    enabled: boolean;
    subject: string;
    body: string; // HTML content
}

export interface EmailConfig {
    enabled: boolean;
    provider: 'smtp' | 'resend' | 'sendgrid';
    apiKey?: string; // For Resend/SendGrid
    host: string;
    port: number;
    secure: boolean;
    auth_user: string;
    auth_pass: string;
    from_name: string;
    from_email: string;
    templates: {
        donation_notification: EmailTemplate; // To Admin
        donation_confirmation: EmailTemplate; // To Donor
        donation_reply: EmailTemplate;        // To Donor (Reply)
    };
}

// Default configuration fallback
export const DEFAULT_CONFIG: SiteConfig = {
    site_title: '温暖投喂小站',
    site_description: '用一份贴心的投喂陪伴创作，快速、安全又安心。',
    site_heading: '来一份暖心的投喂吧',
    site_subheading: '你的支持是我们继续创作的能量，谢谢每一位一路相伴的守护者！',

    creator_name: '小宇航员',
    creator_role: '站长 / 创作者',
    creator_description: '热爱分享的代码种田人，用键盘播种快乐，用故事陪伴每一个夜晚。',
    creator_avatar: '/placeholder-user.jpg',
    creator_avatar_badge: '⚡',
    creator_avatar_badge_bg_visible: true,
    creator_avatar_badge_bg_color: '#3b82f6', // blue-500
    creator_avatar_badge_type: 'emoji',
    creator_avatar_badge_content: '⚡',
    creator_qq_number: '',
    payment_alipay_qr: '/placeholder.svg',
    payment_wechat_qr: '/placeholder.svg',
    payment_qq_number: '',

    form_title: '给创作者一口能量',
    form_description: '每一份投喂都是继续前进的动力，谢谢你的支持与陪伴',
    form_amount_min: 0.01,
    form_amount_max: 99999.99,
    form_message_max_length: 500,
    form_name_max_length: 50,
    form_success_message: '感谢你的支持！',
    donation_tips: ['祝老板身体健康！', '加油，看好你！', '一点心意，不成敬意', '催更催更！'],

    payment_methods: [
        { value: 'wechat', label: '微信支付' },
        { value: 'alipay', label: '支付宝' },
        { value: 'qq', label: 'QQ支付' },
        { value: 'other', label: '其他方式' },
    ],

    list_home_limit: 5,
    list_home_title: '最新投喂（取最近 5 位）',

    reasons_title: '为什么要投喂？',
    reasons_items: [
        '和我们一起养肥内容创作',
        '帮助我们守护小站的服务器',
        '催生更多有趣的新功能',
        '加入投喂伙伴的行列',
    ],

    security_title: '安全且贴心',
    security_description: '你的支付信息会被安全处理，敏感数据绝不存储，只会记录必要的投喂信息用于确认。',
    security_visible: true,

    site_hero_emoji: '❤️',
    site_hero_emoji_visible: true,
    site_hero_content_type: 'emoji',
    site_hero_content: '❤️',

    footer: {
        enabled: true,
        text: 'Powered by v0-hexo-donate',
        show_copyright: true,
        show_runtime: true,
        start_date: '2024-01-01',
    },

    form_privacy_text: '数据仅用于确认投喂，隐私我们会好好守护。',
    form_privacy_visible: true,
    payment_methods_button_text: '查看收款方式',
    payment_methods_button_text_close: '收起收款方式',
    payment_methods_description: '打开喜欢的方式扫一扫：',

    email_config: {
        enabled: false,
        provider: 'smtp',
        apiKey: '',
        host: 'smtp.example.com',
        port: 465,
        secure: true,
        auth_user: '',
        auth_pass: '',
        from_name: '投喂小站',
        from_email: 'noreply@example.com',
        templates: {
            donation_notification: {
                enabled: true,
                subject: '【投喂小站】收到新的投喂：{user_name} - ¥{amount}',
                body: '<p>收到新的投喂！</p><p><strong>捐赠者：</strong>{user_name}</p><p><strong>金额：</strong>¥{amount}</p><p><strong>留言：</strong>{user_message}</p>'
            },
            donation_confirmation: {
                enabled: true,
                subject: '【投喂小站】感谢你的支持！',
                body: '<p>亲爱的 {user_name}：</p><p>感谢你的投喂！我们已经收到了你的心意（¥{amount}）。</p><p>你的支持是我们前进的动力！</p>'
            },
            donation_reply: {
                enabled: true,
                subject: '【投喂小站】你的留言有新回复',
                body: '<p>亲爱的 {user_name}：</p><p>站长回复了你的留言：</p><blockquote>{reply_content}</blockquote><p>再次感谢你的支持！</p>'
            }
        }
    }
};

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
