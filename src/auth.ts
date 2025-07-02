
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User, UserPsyche, UserRole } from '@prisma/client';
import { authConfig } from './auth.config'; // Import the base Edge-compatible config
import Resend from "next-auth/providers/resend";


// --- Environment Variable Checks ---
// These checks ensure that the authentication system is configured correctly,
// preventing common deployment errors and providing clear warnings to developers.
if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET) {
  console.error('\x1b[31m%s\x1b[0m', 'FATAL: AUTH_SECRET is not set. This is required for production.');
  throw new Error('Missing AUTH_SECRET environment variable. This is required for production.');
}

if (!process.env.AUTH_SECRET) {
    console.warn(
        '\x1b[33m%s\x1b[0m',
        'WARNING: AUTH_SECRET is not set. A temporary secret will be generated. Please set a permanent secret in your .env file.'
    );
}
if (!process.env.AUTH_RESEND_KEY || process.env.AUTH_RESEND_KEY === 'YOUR_API_KEY_HERE') {
    console.warn(
        '\x1b[33m%s\x1b[0m',
        'WARNING: AUTH_RESEND_KEY is not set. Magic link (Resend) login will not work.'
    );
}

const resendFrom = process.env.AUTH_RESEND_FROM || 'noreply@aevonos.com';
if (resendFrom === 'noreply@aevonos.com') {
     console.warn(
        '\x1b[33m%s\x1b[0m',
        'WARNING: AUTH_RESEND_FROM is not set. Using default "noreply@aevonos.com". This may fail if the domain is not verified on Resend.'
    );
}
// --- End Environment Variable Checks ---

const providers = [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (isPasswordValid) {
          // This object is passed to the `user` property of the `jwt` callback
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            psyche: user.psyche,
            agentAlias: user.agentAlias,
            firstWhisper: user.firstWhisper,
            unlockedChaosCardKeys: user.unlockedChaosCardKeys,
          };
        }
        return null;
      },
    }),
];

// Conditionally add the Resend provider only if the API key is set.
// This prevents runtime errors if the key is missing.
if (process.env.AUTH_RESEND_KEY && process.env.AUTH_RESEND_KEY !== 'YOUR_API_KEY_HERE') {
    providers.push(Resend({
        from: resendFrom
    }));
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // Spread the base config
  secret: process.env.AUTH_SECRET, // Explicitly pass the secret
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers,
  callbacks: {
    ...authConfig.callbacks, // Include callbacks from the base config

    // JWT and Session callbacks are Node.js-safe and are needed to enrich the session
    async jwt({ token, user }) {
      if (user) {
        // On initial sign-in, add the user's properties to the token.
        token.id = user.id;
        token.role = (user as User).role;
        token.psyche = (user as User).psyche;
        token.agentAlias = (user as User).agentAlias;
        token.firstWhisper = (user as User).firstWhisper;
        token.unlockedChaosCardKeys = (user as User).unlockedChaosCardKeys;
      }
      
      // On every invocation (sign-in or session validation), re-fetch user's workspace
      // to ensure the session token is always up-to-date.
      if (token.id) {
          const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: {
                  workspaces: { select: { id: true } }
              }
          });
          
          if (dbUser) {
              // Assume user is in one workspace for this OS version.
              token.workspaceId = dbUser.workspaces[0]?.id;
          }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.psyche = token.psyche as UserPsyche;
        session.user.agentAlias = token.agentAlias as string | null;
        session.user.workspaceId = token.workspaceId as string;
        session.user.firstWhisper = token.firstWhisper as string | null;
        session.user.unlockedChaosCardKeys = token.unlockedChaosCardKeys as string[];
      }
      return session;
    },
  },
});
