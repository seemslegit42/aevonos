
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    throw new Error('JWT_SECRET is not set in the environment variables.');
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Token expires in 1 hour
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
 * Extracts and verifies the JWT from a 'session' cookie in the request.
 * @param request The NextRequest object.
 * @returns The session payload if the token is valid, otherwise null.
 */
export async function getSession(request: NextRequest) {
    const token = request.cookies.get('session')?.value;
    if (!token) return null;
    return await decrypt(token);
}
