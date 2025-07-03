
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { UserRole } from '@prisma/client';
import { confirmPendingTransaction as confirmTxService } from '@/services/ledger-service';

interface RouteParams {
  params: {
    transactionId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { user: sessionUser, workspace } = await getAuthenticatedUser();
        
        if (sessionUser.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Forbidden: Administrator access required for this action.' }, { status: 403 });
        }
        
        const { transactionId } = params;
        const confirmedTransaction = await confirmTxService(transactionId, workspace.id);

        return NextResponse.json(confirmedTransaction);
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error(`[API /billing/transactions/{id}/confirm POST]`, error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
