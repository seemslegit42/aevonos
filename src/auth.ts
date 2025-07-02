
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import { authConfig } from './auth.config';
import prisma from './lib/prisma';
import type { User, UserRole, UserPsyche } from '@prisma/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
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

        const isPasswordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (isPasswordMatch) {
          return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.psyche = token.psyche as UserPsyche;
        session.user.workspaceId = token.workspaceId as string;
        session.user.agentAlias = token.agentAlias as string;
      }
      return session;
    },
    async jwt({ token, user }) {
        if (user) {
            const dbUser = user as User; // Cast to include all our fields
            
            const workspace = await prisma.workspace.findFirst({
                where: { members: { some: { id: dbUser.id }}},
                select: { id: true }
            });

            token.id = dbUser.id;
            token.role = dbUser.role;
            token.psyche = dbUser.psyche;
            token.agentAlias = dbUser.agentAlias;
            token.workspaceId = workspace?.id;
        }
      return token;
    },
  },
});
