export const adminConfig = {
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

export function encodeCredentials(password: string): string {
  // Use base64 encoding that works in both browser and server
  if (typeof window !== 'undefined') {
    return btoa(`admin:${password}`);
  }
  return Buffer.from(`admin:${password}`).toString('base64');
}

export function verifyCredentials(encodedToken: string, password: string): boolean {
  try {
    const expectedToken = encodeCredentials(password);
    return encodedToken === expectedToken;
  } catch {
    return false;
  }
}

/**
 * Verify authentication from Next.js request
 * Returns { isValid: boolean }
 */
export async function verifyAuth(request: Request): Promise<{ isValid: boolean }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return { isValid: false };
    }

    const encodedToken = authHeader.substring(6); // Remove 'Basic ' prefix
    const isValid = verifyCredentials(encodedToken, adminConfig.password);

    return { isValid };
  } catch (error) {
    console.error('[投喂小站] Auth verification error:', error);
    return { isValid: false };
  }
}
