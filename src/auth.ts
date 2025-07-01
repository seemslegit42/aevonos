
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User, UserPsyche, UserRole } from '@prisma/client';
import { authConfig } from './auth.config'; // Import the base Edge-compatible config

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // Spread the base config
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
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
            firstWhisper: user.firstWhisper
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks, // Include callbacks from the base config

    // JWT and Session callbacks are Node.js-safe and are needed to enrich the session
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as User).role;
        token.psyche = (user as User).psyche;
        token.agentAlias = (user as User).agentAlias;
        token.firstWhisper = (user as User).firstWhisper;
        
        const workspace = await prisma.workspace.findFirst({
          where: { members: { some: { id: user.id } } },
          select: { id: true },
        });
        token.workspaceId = workspace?.id;
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
      }
      return session;
    },
  },
});
