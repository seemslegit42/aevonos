
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    throw new Error('JWT_SECRET is not set in the environment variables.');
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


/**
 * Retrieves the current user's data based on the session. For use in RSCs and Server Actions.
 * @returns The user object (without password) or null if not authenticated.
 */
export async function getCurrentUser() {
  const session = await getServerActionSession();
  if (!session?.userId) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
    },
  });
  return user;
}
