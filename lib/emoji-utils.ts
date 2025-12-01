/**
 * Emoji Utility Functions
 * Provides functions to extract and manipulate emojis in text
 */

/**
 * Extract the first emoji from a string
 * @param text - The text to extract emoji from
 * @returns An object containing the emoji and the text without the emoji
 */
export function extractFirstEmoji(text: string): { emoji: string | null; textWithoutEmoji: string } {
    // Regex pattern to match emojis
    // This pattern matches most common emojis including:
    // - Basic emojis
    // - Emojis with skin tone modifiers
    // - Emojis with ZWJ sequences (like family emojis)
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;

    const match = text.match(emojiRegex);

    if (match) {
        const emoji = match[0];
        const textWithoutEmoji = text.replace(emoji, '').trim();
        return { emoji, textWithoutEmoji };
    }

    return { emoji: null, textWithoutEmoji: text };
}

/**
 * Check if a string contains any emoji
 * @param text - The text to check
 * @returns true if the text contains at least one emoji
 */
export function containsEmoji(text: string): boolean {
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;
    return emojiRegex.test(text);
}

/**
 * Remove all emojis from a string
 * @param text - The text to remove emojis from
 * @returns The text without any emojis
 */
export function removeAllEmojis(text: string): string {
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    return text.replace(emojiRegex, '').trim();
}
