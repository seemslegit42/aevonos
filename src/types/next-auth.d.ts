
import type { User as PrismaUser } from '@prisma/client';
import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      workspaceId: string;
      role: PrismaUser['role'];
      psyche: PrismaUser['psyche'];
      agentAlias: string | null;
      firstWhisper: string | null;
    } & DefaultSession['user'];
  }

  interface User {
      role: PrismaUser['role'];
      psyche: PrismaUser['psyche'];
      agentAlias: string | null;
      firstWhisper: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    workspaceId: string;
    role: PrismaUser['role'];
    psyche: PrismaUser['psyche'];
    agentAlias: string | null;
    firstWhisper: string | null;
  }
}
