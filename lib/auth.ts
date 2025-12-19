import { encrypt, decrypt, adminPassword } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  const password = formData.get('password');

  if (password !== adminPassword) {
    throw new Error('密码错误');
  }

  // Create the session
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({ user: 'admin', expires });

  // Save the session in a cookie
  (await cookies()).set('session', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict" });
}

export async function logout() {
  (await cookies()).set('session', '', { expires: new Date(0) });
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}
