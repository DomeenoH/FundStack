import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function verifyAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  try {
    const token = authHeader.split(' ')[1];
    if (!token) return false;

    // Decode the base64 token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    // Verify credentials
    return username === 'admin' && password === ADMIN_PASSWORD;
  } catch (error) {
    console.error('[v0] Auth verification error:', error);
    return false;
  }
}
