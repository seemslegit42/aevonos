
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';
import { TransactionType } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerActionSession();

    const debitTransactions = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        workspaceId: session.workspaceId,
        type: TransactionType.DEBIT,
      },
    });

    const tributeTransactions = await prisma.transaction.aggregate({
        _sum: {
            tributeAmount: true,
        },
        where: {
            workspaceId: session.workspaceId,
            type: TransactionType.TRIBUTE,
        },
    });

    const totalDebits = debitTransactions._sum.amount?.toNumber() || 0;
    const totalTributes = tributeTransactions._sum.tributeAmount?.toNumber() || 0;

    const totalCreditsBurned = totalDebits + totalTributes;

    return NextResponse.json({ totalCreditsBurned });

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /workspaces/me/economy-stats GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve economy stats.' }, { status: 500 });
  }
}
