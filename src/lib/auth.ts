
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Be extra robust about the secret key.
// If it's missing or an empty string, use a placeholder for development.
// This prevents the server from crashing on startup if the .env is not configured.
const secretKey = (process.env.JWT_SECRET && process.env.JWT_SECRET.trim() !== '') 
    ? process.env.JWT_SECRET 
    : 'this-is-a-default-secret-key-for-development';

if (secretKey === 'this-is-a-default-secret-key-for-development') {
    console.warn(
        '\x1b[33m%s\x1b[0m', // Yellow text
        'WARNING: JWT_SECRET is not set in environment variables. Using a default, insecure key for development purposes. Please set a strong, unique secret in your .env file for production.'
    );
}
const key = new TextEncoder().encode(secretKey);


export async function encrypt(payload: { expires: Date, [key: string]: any }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(payload.expires.getTime() / 1000))
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // This could be because the token is expired or invalid
    console.error('JWT Verification Error:', error);
    return null;
  }
}

/**
 * Extracts and verifies the JWT from a 'session' cookie in an API Route Request.
 * @param request The NextRequest object.
 * @returns The session payload if the token is valid, otherwise null.
 */
export async function getSession(request: NextRequest) {
    const token = request.cookies.get('session')?.value;
    if (!token) return null;
    return await decrypt(token);
}

/**
 * Extracts and verifies the JWT from a 'session' cookie in a Server Action or RSC.
 * @returns The session payload if the token is valid, otherwise null.
 */
export async function getServerActionSession() {
    const token = cookies().get('session')?.value;
    if (!token) return null;
    return await decrypt(token);
}
