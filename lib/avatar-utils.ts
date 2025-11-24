/**
 * Avatar utilities for generating user avatars
 * Supports Cravatar and QQ avatar API
 */

import crypto from 'crypto';

/**
 * Extract QQ number from email
 * Supports formats: 123456@qq.com, 123456@vip.qq.com
 */
export function extractQQFromEmail(email: string): string | null {
    if (!email) return null;

    const qqEmailPattern = /^(\d+)@(qq\.com|vip\.qq\.com)$/i;
    const match = email.match(qqEmailPattern);

    return match ? match[1] : null;
}

/**
 * Generate MD5 hash for email (used by Cravatar)
 */
export function md5Hash(email: string): string {
    return crypto
        .createHash('md5')
        .update(email.toLowerCase().trim())
        .digest('hex');
}

/**
 * Get QQ avatar URL
 * QQ avatar API only supports specific spec values: 40, 100, 140, 640
 * We map the requested size to the nearest supported spec
 */
export function getQQAvatarUrl(qqNumber: string, size: number = 640): string {
    // Map size to nearest supported spec value
    const validSpecs = [40, 100, 140, 640];
    const spec = validSpecs.reduce((prev, curr) => {
        return Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev;
    });

    return `https://q.qlogo.cn/headimg_dl?dst_uin=${qqNumber}&spec=${spec}&img_type=jpg`;
}

/**
 * Get Cravatar URL
 * Cravatar is a Chinese alternative to Gravatar
 */
export function getCravatarUrl(email: string, size: number = 200): string {
    const hash = md5Hash(email);
    return `https://cravatar.cn/avatar/${hash}?s=${size}&d=identicon`;
}

/**
 * Get user avatar URL based on email
 * Priority: QQ Avatar > Cravatar > Default
 */
export function getUserAvatarUrl(email?: string, size: number = 200): string {
    // No email provided, return default
    if (!email) {
        return '/placeholder-user.jpg';
    }

    // Check if it's a QQ email
    const qqNumber = extractQQFromEmail(email);
    if (qqNumber) {
        return getQQAvatarUrl(qqNumber, size);
    }

    // Use Cravatar for other emails
    return getCravatarUrl(email, size);
}

/**
 * Get creator avatar URL with QQ fallback
 * If avatar is default placeholder and QQ number is provided, use QQ avatar
 */
export function getCreatorAvatarUrl(
    avatarPath: string,
    qqNumber?: string,
    size: number = 640
): string {
    // If custom avatar is set and not placeholder, use it
    if (avatarPath && avatarPath !== '/placeholder-user.jpg') {
        return avatarPath;
    }

    // Fallback to QQ avatar if QQ number is provided
    if (qqNumber) {
        return getQQAvatarUrl(qqNumber, size);
    }

    // Use default placeholder
    return '/placeholder-user.jpg';
}

/**
 * Check if input is a QQ number (5-11 digits)
 */
export function isQQNumber(input: string): boolean {
    return /^\d{5,11}$/.test(input.trim());
}

/**
 * Normalize email/QQ input to email format
 * If input is QQ number, convert to QQ email
 * This ensures users with same QQ are treated as same user
 */
export function normalizeEmailInput(input: string): string {
    if (!input) return '';

    const trimmed = input.trim();

    // If it's a QQ number, convert to QQ email
    if (isQQNumber(trimmed)) {
        return `${trimmed}@qq.com`;
    }

    // Otherwise return as-is (should be email)
    return trimmed.toLowerCase();
}
// Mask email or QQ number for privacy display
export function maskContact(input?: string): string {
    if (!input) return '';
    const email = input.trim();
    // QQ email detection
    const qqMatch = email.match(/^(\d{5,11})@(qq|vip)\.qq\.com$/i);
    if (qqMatch) {
        const qq = qqMatch[1];
        if (qq.length <= 4) return '*'.repeat(qq.length);
        const start = qq.slice(0, 2);
        const end = qq.slice(-2);
        const masked = `${start}${'*'.repeat(qq.length - 4)}${end}`;
        return `${masked}@${qqMatch[2]}.qq.com`;
    }
    // General email masking
    const atIdx = email.indexOf('@');
    if (atIdx <= 1) return '*'.repeat(atIdx) + email.slice(atIdx);
    const namePart = email.slice(0, atIdx);
    const domain = email.slice(atIdx);
    if (namePart.length <= 2) return '*'.repeat(namePart.length) + domain;
    const start = namePart.slice(0, 2);
    const masked = `${start}${'*'.repeat(namePart.length - 2)}`;
    return `${masked}${domain}`;
}
