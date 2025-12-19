import { SignJWT, jwtVerify } from 'jose';

export const secretKey = process.env.JWT_SECRET;
export const adminPassword = process.env.ADMIN_PASSWORD;

// Throw error if critical environment variables are missing
if (!secretKey) {
    throw new Error('JWT_SECRET environment variable is not defined');
}
if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is not defined');
}

const key = new TextEncoder().encode(secretKey);
const ALG = 'HS256';

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: [ALG],
    });
    return payload;
}

export function checkAdminPassword(password: string): boolean {
    return password === adminPassword;
}
