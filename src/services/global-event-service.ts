
'use server';
/**
 * @fileOverview The service for managing Global Agentic Events (GAEs), like Black Wagers.
 * This is the core logic that would power a GlobalEventManager kernel node.
 */
import prisma from '@/lib/prisma';
import { Prisma, EventStatus, TransactionType } from '@prisma/client';
import { InsufficientCreditsError } from '@/lib/errors';
import { artifactManifests } from '@/config/artifacts';
import { createHmac } from 'crypto';

/**
 * Creates a new Black Wager event.
 * This should be an admin-only operation.
 */
export async function createBlackWager({ eventName, poolTarget, durationHours, shardReward }: {
    eventName: string;
    poolTarget: number;
    durationHours: number;
    shardReward: string;
}) {
    // In a real implementation, we'd check for admin/owner permissions here.
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    const existingEvent = await prisma.globalAgenticEvent.findFirst({
        where: { status: 'ACTIVE' }
    });

    if (existingEvent) {
        throw new Error('An active Black Wager is already in progress.');
    }

    return prisma.globalAgenticEvent.create({
        data: {
            eventName,
            poolTarget: new Prisma.Decimal(poolTarget),
            expiresAt,
            shardReward,
        }
    });
}


/**
 * Allows a workspace to make a contribution to the active Black Wager.
 * This is an atomic transaction.
 */
export async function makeBlackWagerContribution({ workspaceId, userId, amount }: {
    workspaceId: string;
    userId: string;
    amount: number;
}) {
    if (amount <= 0) {
        throw new Error('Contribution amount must be positive.');
    }
    const signatureSecret = process.env.AEGIS_SIGNING_SECRET || 'default_secret_for_dev';

    return prisma.$transaction(async (tx) => {
        const activeEvent = await tx.globalAgenticEvent.findFirst({
            where: { status: 'ACTIVE' }
        });

        if (!activeEvent) {
            throw new Error('There is no active Black Wager to contribute to.');
        }

        if (new Date() > activeEvent.expiresAt) {
            await tx.globalAgenticEvent.update({ where: { id: activeEvent.id }, data: { status: 'CONCLUDED' } });
            throw new Error('This Black Wager has already expired.');
        }
        
        const workspace = await tx.workspace.findUniqueOrThrow({
            where: { id: workspaceId },
            select: { credits: true }
        });

        if (Number(workspace.credits) < amount) {
            throw new InsufficientCreditsError('Insufficient credits for this contribution.');
        }
        
        // Debit the workspace
        await tx.workspace.update({
            where: { id: workspaceId },
            data: { credits: { decrement: new Prisma.Decimal(amount) } }
        });

        // Log the contribution
        await tx.contribution.create({
            data: {
                amount: new Prisma.Decimal(amount),
                workspaceId,
                userId,
                eventId: activeEvent.id,
            }
        });
        
        // Update the event's pool
        const updatedEvent = await tx.globalAgenticEvent.update({
            where: { id: activeEvent.id },
            data: {
                currentPool: { increment: new Prisma.Decimal(amount) }
            }
        });

        const isWinner = Number(updatedEvent.currentPool) >= Number(updatedEvent.poolTarget);
        const description = isWinner 
            ? `Winning contribution to Black Wager: ${updatedEvent.eventName}`
            : `Contribution to Black Wager: ${updatedEvent.eventName}`;
        
        const transactionDataForSigning = {
            workspaceId, userId, type: TransactionType.DEBIT,
            amount: new Prisma.Decimal(amount).toFixed(8),
            description, instrumentId: activeEvent.id,
            timestamp: new Date().toISOString()
        };
        const signature = createHmac('sha256', signatureSecret)
            .update(JSON.stringify(transactionDataForSigning))
            .digest('hex');

        await tx.transaction.create({
            data: {
                workspaceId, userId, type: TransactionType.DEBIT,
                amount: new Prisma.Decimal(amount),
                description,
                instrumentId: activeEvent.id,
                status: 'COMPLETED',
                aegisSignature: signature,
            }
        });

        // Check if the contribution meets the target
        if (isWinner) {
            // This workspace wins!
            await tx.globalAgenticEvent.update({
                where: { id: updatedEvent.id },
                data: {
                    status: 'CONCLUDED',
                    winningWorkspaceId: workspaceId,
                }
            });

            // Grant the Shard Reward (as a system effect)
            if (updatedEvent.shardReward) {
                const cardManifest = artifactManifests.find(c => c.id === updatedEvent.shardReward);
                const durationMs = (cardManifest?.durationMinutes || 60) * 60 * 1000;
                await tx.activeSystemEffect.create({
                    data: {
                        workspaceId: workspaceId,
                        cardKey: updatedEvent.shardReward,
                        expiresAt: new Date(Date.now() + durationMs),
                    },
                });
            }
            
            return { success: true, eventConcluded: true, message: `Your contribution has secured the ${updatedEvent.shardReward} for your Syndicate!` };
        } else {
            return { success: true, eventConcluded: false, message: 'Your tribute has been accepted.' };
        }
    });
}
