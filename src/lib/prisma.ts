
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'
import ws from 'ws'
 
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
 
const neon = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(neon, { ws })

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
 
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
 
export default prisma;
