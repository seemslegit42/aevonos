
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { TransactionType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { user: sessionUser, workspace } = await getAuthenticatedUser();

    if (!workspace || workspace.ownerId !== sessionUser.id) {
        return NextResponse.json({ error: 'Forbidden. Architect access required.' }, { status: 403 });
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await prisma.transaction.findMany({
        where: {
            workspaceId: workspace.id,
            createdAt: {
                gte: thirtyDaysAgo,
            },
            status: 'COMPLETED',
        },
        orderBy: {
            createdAt: 'asc',
        }
    });

    const dailyData = transactions.reduce((acc, tx) => {
        const date = new Date(tx.createdAt).toISOString().split('T')[0];
        if (!acc[date]) {
            acc[date] = { date, credits_burned: 0, credits_gained: 0 };
        }
        
        if (tx.type === TransactionType.DEBIT || tx.type === TransactionType.TRIBUTE) {
            // For tributes, the 'amount' is net, but tributeAmount is the cost.
            const cost = tx.type === TransactionType.TRIBUTE ? Number(tx.tributeAmount) : Number(tx.amount);
            acc[date].credits_burned += cost;
        }
        
        if (tx.type === TransactionType.CREDIT || tx.type === TransactionType.TRIBUTE) {
             // For tributes, boonAmount is the gain.
            const gain = tx.type === TransactionType.TRIBUTE ? Number(tx.boonAmount) : Number(tx.amount);
            acc[date].credits_gained += gain;
        }
        
        return acc;
    }, {} as Record<string, { date: string, credits_burned: number, credits_gained: number }>);
    
    // Fill in missing days with 0
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (!dailyData[dateStr]) {
            dailyData[dateStr] = { date: dateStr, credits_burned: 0, credits_gained: 0 };
        }
    }

    const sortedData = Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return NextResponse.json(sortedData);

  } catch (error) {
    if (error instanceof Error && (error.message.includes('token expired') || error.message.includes('no token'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /admin/economic-pulse GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve economic pulse data.' }, { status: 500 });
  }
}
