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
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
.header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 32px; text-align: center; color: white; }
.header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
.content { padding: 40px 32px; }
.amount-card { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px; }
.amount { font-size: 42px; font-weight: 800; color: #1e40af; margin: 8px 0; letter-spacing: -0.025em; }
.label { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
.message-box { background: #f9fafb; border-radius: 12px; padding: 24px; margin-top: 24px; border-left: 4px solid #3b82f6; }
.message-text { font-style: italic; color: #4b5563; margin: 0; font-size: 15px; }
.footer { background: #f9fafb; padding: 32px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
.button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 24px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: all 0.2s; }
.avatar { width: 64px; height: 64px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.2); margin-bottom: 16px; object-fit: cover; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<img src="{creator_avatar}" alt="Avatar" class="avatar">
<h1>🎉 好消息！收到新的投喂</h1>
</div>
<div class="content">
<p style="font-size: 16px; margin-bottom: 24px;">Hi <strong>{creator_name}</strong>，</p>
<p style="color: #6b7280; margin-bottom: 32px;">刚刚收到了一笔新的支持！以下是详细信息：</p>
<div class="amount-card">
<div class="label">投喂金额</div>
<div class="amount">¥ {amount}</div>
<div class="label" style="margin-top: 16px;">来自</div>
<div style="font-size: 18px; font-weight: 600; color: #1f2937; margin-top: 4px;">{user_name}</div>
</div>
<div class="message-box">
<p class="message-text">"{user_message}"</p>
</div>
<div style="text-align: center;">
<a href="#" class="button">前往后台查看</a>
</div>
</div>
<div class="footer">
<p>Powered by FundStack</p>
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
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
.header { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 48px 32px; text-align: center; color: white; }
.header h1 { margin: 16px 0 0 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; }
.content { padding: 48px 32px; text-align: center; }
.avatar { width: 80px; height: 80px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); object-fit: cover; }
.message { font-size: 18px; color: #4b5563; margin-bottom: 32px; line-height: 1.8; }
.amount-badge { display: inline-block; background: #fdf2f8; color: #be185d; padding: 12px 24px; border-radius: 9999px; font-weight: 800; font-size: 24px; margin-bottom: 32px; box-shadow: 0 2px 4px rgba(190, 24, 93, 0.1); }
.footer { background: #f9fafb; padding: 32px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
.divider { height: 1px; background: #e5e7eb; width: 60px; margin: 0 auto 32px auto; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<img src="{creator_avatar}" alt="{creator_name}" class="avatar">
<h1>感谢你的支持！</h1>
</div>
<div class="content">
<p class="message">Hi <strong>{user_name}</strong>，</p>
<p class="message">收到了你的投喂！非常感谢你对 <strong>{creator_name}</strong> 的支持，这对我来说意义重大。</p>
<div class="amount-badge">
¥ {amount}
</div>
<div class="divider"></div>
<p class="message" style="font-size: 16px; margin-bottom: 0;">我会继续努力创作更好的内容！</p>
</div>
<div class="footer">
<p>Powered by FundStack</p>
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
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
.header { background: linear-gradient(135deg, #1f2937 0%, #0f172a 100%); padding: 40px 32px; text-align: center; color: white; }
.header h1 { margin: 16px 0 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
.content { padding: 40px 32px; }
.avatar { width: 72px; height: 72px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); object-fit: cover; }
.reply-box { background: #f8fafc; border-radius: 16px; padding: 32px; margin: 24px 0; border: 1px solid #e2e8f0; position: relative; }
.reply-label { font-size: 12px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: block; }
.reply-text { font-size: 16px; color: #1f2937; margin: 0; white-space: pre-wrap; line-height: 1.8; }
.original-message { margin-top: 40px; padding-top: 24px; border-top: 1px dashed #e5e7eb; color: #6b7280; font-size: 14px; }
.footer { background: #f9fafb; padding: 32px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<img src="{creator_avatar}" alt="{creator_name}" class="avatar">
<h1>收到新的回复</h1>
</div>
<div class="content">
<p style="font-size: 16px;">Hi <strong>{user_name}</strong>，</p>
<p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;"><strong>{creator_name}</strong> 刚刚回复了你的投喂留言：</p>
<div class="reply-box">
<span class="reply-label">回复内容</span>
<p class="reply-text">{reply_content}</p>
</div>
<div class="original-message">
<p>你的留言："{user_message}"</p>
</div>
</div>
<div class="footer">
<p>Powered by FundStack</p>
</div>
</div>
</body>
</html>`,
            },
        }
    }
};
