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
