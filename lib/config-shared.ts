/**
 * Shared Configuration Types and Defaults
 * Safe for use in both Server and Client components
 */

export interface PaymentMethod {
    value: string;
    label: string;
}

export interface SiteConfig {
    // Site basic information
    site_title: string;
    site_description: string;
    site_heading: string;
    site_subheading: string; // Deprecated, kept for backward compatibility
    site_subtitles: string[]; // New field for multiple subtitles
    site_nav_title: string;
    site_nav_show_avatar: boolean;

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
    enable_captcha: boolean;

    // Payment methods
    payment_methods: PaymentMethod[];

    // List display configuration
    list_home_limit: number;
    list_home_title: string;
    list_home_subtitle: string;

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
    site_subtitles: [
        '你的支持是我们继续创作的能量，谢谢每一位一路相伴的守护者！',
        '投喂是爱的表达，感谢有你！',
        '每一份心意都将被铭记。'
    ],
    site_nav_title: '投喂小站',
    site_nav_show_avatar: false,

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
    enable_captcha: false,

    payment_methods: [
        { value: 'wechat', label: '微信支付' },
        { value: 'alipay', label: '支付宝' },
        { value: 'qq', label: 'QQ支付' },
        { value: 'other', label: '其他方式' },
    ],

    list_home_limit: 5,
    list_home_title: '最新投喂（取最近 5 位）',
    list_home_subtitle: '感谢每一位支持者',

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
        text: 'Powered by FundStack',
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
                subject: '🎉 新的投喂收到啦！',
                body: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Donation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f9f9f9; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
        <div style="background-color: #3b82f6; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; color: #ffffff; font-weight: bold;">🎉 收到新的投喂</h1>
        </div>
        <div style="padding: 32px 24px;">
            <p style="margin-bottom: 24px;">Hi <strong>{creator_name}</strong>，</p>
            <p style="color: #666666; margin-bottom: 24px;">刚刚收到了一笔新的支持！以下是详细信息：</p>
            
            <table style="width: 100%; background-color: #f0f7ff; border-radius: 8px; margin-bottom: 24px; border-collapse: collapse;">
                <tr>
                    <td style="padding: 24px; text-align: center;">
                        <div style="font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">投喂金额</div>
                        <div style="font-size: 32px; font-weight: bold; color: #1e40af;">¥ {amount}</div>
                        <div style="font-size: 14px; color: #333333; margin-top: 16px;">来自 <strong>{user_name}</strong></div>
                    </td>
                </tr>
            </table>

            <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-style: italic; color: #555555;">"{user_message}"</p>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <a href="#" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">前往后台查看</a>
            </div>
        </div>
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
            <p style="margin: 0;">Powered by FundStack</p>
        </div>
    </div>
</body>
</html>`,
            },
            donation_confirmation: {
                enabled: true,
                subject: '❤️ 感谢你的投喂！',
                body: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Thank You</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f9f9f9; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
        <div style="background-color: #db2777; padding: 32px 24px; text-align: center;">
            <img src="{creator_avatar}" alt="{creator_name}" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid #ffffff; margin-bottom: 16px; display: inline-block;">
            <h1 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: bold;">感谢你的支持！</h1>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
            <p style="margin-bottom: 16px; font-size: 16px;">Hi <strong>{user_name}</strong>，</p>
            <p style="color: #555555; margin-bottom: 24px; line-height: 1.8;">收到了你的投喂！非常感谢你对 <strong>{creator_name}</strong> 的支持，这对我来说意义重大。</p>
            
            <div style="display: inline-block; background-color: #fdf2f8; color: #be185d; padding: 10px 20px; border-radius: 50px; font-weight: bold; font-size: 20px; margin-bottom: 24px;">
                ¥ {amount}
            </div>
            
            <div style="height: 1px; background-color: #eeeeee; width: 60px; margin: 0 auto 24px auto;"></div>
            <p style="color: #666666; margin: 0;">我会继续努力创作更好的内容！</p>
        </div>
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
            <p style="margin: 0;">Powered by FundStack</p>
        </div>
    </div>
</body>
</html>`,
            },
            donation_reply: {
                enabled: true,
                subject: '💌 你的投喂收到了回复',
                body: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Reply</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f9f9f9; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
        <div style="background-color: #1f2937; padding: 32px 24px; text-align: center;">
            <img src="{creator_avatar}" alt="{creator_name}" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid #ffffff; margin-bottom: 16px; display: inline-block;">
            <h1 style="margin: 0; font-size: 20px; color: #ffffff; font-weight: bold;">收到新的回复</h1>
        </div>
        <div style="padding: 32px 24px;">
            <p style="margin-bottom: 16px;">Hi <strong>{user_name}</strong>，</p>
            <p style="color: #555555; margin-bottom: 24px;"><strong>{creator_name}</strong> 刚刚回复了你的投喂留言：</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">回复内容</div>
                <div style="color: #333333; line-height: 1.6;">{reply_content}</div>
            </div>
            
            <div style="border-top: 1px dashed #e5e7eb; padding-top: 16px; color: #9ca3af; font-size: 13px;">
                <p style="margin: 0;">你的留言："{user_message}"</p>
            </div>
        </div>
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
            <p style="margin: 0;">Powered by FundStack</p>
        </div>
    </div>
</body>
</html>`,
            },
        }
    }
};
