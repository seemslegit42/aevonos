
'use server';
/**
 * @fileOverview The core Klepsydra service for calculating outcomes.
 * This is the heart of the Profit Pulse Engine.
 */
import {
  getCurrentPulseValue,
  recordWin,
  recordLoss,
  shouldTriggerPityBoon,
} from './pulse-engine-service';
import { pulseEngineConfig } from '@/config/pulse-engine-config';
import { chaosCardManifest } from '@/config/chaos-cards';
import prisma from '@/lib/prisma';
import { InsufficientCreditsError } from '@/lib/errors';
import { UserPsyche, TransactionType, Prisma } from '@prisma/client';
import { differenceInMinutes } from 'date-fns';

const INSTRUMENT_CONFIG: Record<string, { baseOdds: number; winMultiplier: number }> =
  chaosCardManifest.reduce((acc, card) => {
    // A simple inverse relation to cost for odds, and a direct relation for rewards.
    // These can be tuned for balance.
    acc[card.key] = {
      baseOdds: Math.max(0.05, 1 - card.cost / 2000), 
      winMultiplier: 1.5 + card.cost / 500,
    };
    return acc;
  }, {} as Record<string, { baseOdds: number; winMultiplier: number }>);

// Add specific config for the Oracle, since its cost is variable.
INSTRUMENT_CONFIG['ORACLE_OF_DELPHI_VALLEY'] = { baseOdds: 0.4, winMultiplier: 2.5 };


const PSYCHE_MODIFIERS: Record<UserPsyche, { oddsFactor: number; boonFactor: number }> = {
    [UserPsyche.ZEN_ARCHITECT]: { oddsFactor: 1.0, boonFactor: 1.0 }, // The baseline experience
    [UserPsyche.SYNDICATE_ENFORCER]: { oddsFactor: 0.85, boonFactor: 1.25 }, // Higher risk, higher reward
    [UserPsyche.RISK_AVERSE_ARTISAN]: { oddsFactor: 1.15, boonFactor: 0.8 }, // Lower risk, lower reward
};

// Create a list of all card keys that are purely for aesthetic system effects.
const aestheticEffectCardKeys = chaosCardManifest
    .filter(card => card.cardClass === 'AESTHETIC' && card.systemEffect.includes('UI theme'))
    .map(card => card.key);

// List of instruments that are pure gambles and should not be "owned".
const PURE_FOLLY_INSTRUMENTS = ['ORACLE_OF_DELPHI_VALLEY', 'SISYPHUSS_ASCENT', 'MERCHANT_OF_CABBAGE'];


/**
 * Atomically processes a tribute for a Folly Instrument (e.g., Chaos Card, Oracle). 
 * This function handles all logic: outcome calculation, credit validation, database updates, and transaction logging.
 * @param userId The user making the tribute.
 * @param workspaceId The user's workspace.
 * @param instrumentId The key of the instrument being used.
 * @param tributeAmountOverride The amount of the tribute, which overrides the manifest cost.
 * @returns An object with the final outcome and boon amount.
 */
export async function processFollyTribute(
  userId: string,
  workspaceId: string,
  instrumentId: string,
  tributeAmountOverride?: number
) {
    const instrumentManifest = chaosCardManifest.find(card => card.key === instrumentId);
    if (!instrumentManifest) {
        throw new Error('Instrument not found in manifest.');
    }
    
    const tributeAmount = tributeAmountOverride ?? instrumentManifest.cost;

    return prisma.$transaction(async (tx) => {
        // --- 1. PRE-CHECK AND OUTCOME CALCULATION ---
        const [user, workspace] = await Promise.all([
            tx.user.findUniqueOrThrow({ where: { id: userId }, select: { psyche: true } }),
            tx.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { credits: true } }),
        ]);

        if ((workspace.credits as unknown as number) < tributeAmount) {
            throw new InsufficientCreditsError('Cannot make tribute. Insufficient credits.');
        }
        
        const instrument = INSTRUMENT_CONFIG[instrumentId] || { baseOdds: 0.5, winMultiplier: 2 };
        const modifiers = PSYCHE_MODIFIERS[user.psyche] || PSYCHE_MODIFIERS.ZEN_ARCHITECT;
        const modifiedBaseOdds = instrument.baseOdds * modifiers.oddsFactor;
        const modifiedWinMultiplier = instrument.winMultiplier * modifiers.boonFactor;

        // Update risk aversion based on this tribute
        const maxPlausibleTribute = 500; // An arbitrary max to normalize against
        const tributeRatio = Math.min(1, tributeAmount / maxPlausibleTribute);
        const riskAversionUpdate = 1 - tributeRatio; // Higher tribute = lower aversion score

        await tx.pulseProfile.upsert({
            where: { userId },
            update: { riskAversion: riskAversionUpdate },
            create: {
                userId,
                riskAversion: riskAversionUpdate,
                phaseOffset: Math.random() * 2 * Math.PI,
            }
        });

        const luckWeight = await getCurrentPulseValue(userId, tx);
        const isPity = await shouldTriggerPityBoon(userId);
        
        const finalOdds = Math.max(0, Math.min(1, modifiedBaseOdds * luckWeight));
        
        let outcome = 'loss';
        let boonAmount = 0;
        
        if (isPity) {
            outcome = 'pity_boon';
            boonAmount = tributeAmount * 0.5;
        } else if (Math.random() < finalOdds) {
            outcome = 'win';
            boonAmount = tributeAmount * modifiedWinMultiplier;
        }

        const netAmount = boonAmount - tributeAmount;

        // --- 2. ATOMIC DATABASE WRITES ---
        if (outcome === 'loss') {
            await recordLoss(userId, tx);
        } else {
            await recordWin(userId, tx);
        }

        await tx.workspace.update({
            where: { id: workspaceId },
            data: { credits: { increment: new Prisma.Decimal(netAmount) } },
        });

        await tx.transaction.create({
            data: {
                workspaceId, userId, instrumentId: instrumentId,
                type: TransactionType.TRIBUTE,
                amount: new Prisma.Decimal(netAmount),
                description: `Tribute: ${instrumentManifest.name} - ${outcome}`,
                luckWeight, outcome, boonAmount: new Prisma.Decimal(boonAmount),
                userPsyche: user.psyche, status: 'COMPLETED',
            }
        });

        // If it's a win, and the instrument is ownable, award it.
        if ((outcome === 'win' || outcome === 'pity_boon') && !PURE_FOLLY_INSTRUMENTS.includes(instrumentId)) {
            const cardInDb = await tx.chaosCard.findUnique({ where: { key: instrumentId } });
            if (cardInDb) {
                 await tx.user.update({
                    where: { id: userId },
                    data: { ownedChaosCards: { connect: { id: cardInDb.id } } },
                });
            }
            
            if (instrumentManifest.systemEffect && aestheticEffectCardKeys.includes(instrumentId)) {
               await tx.activeSystemEffect.deleteMany({
                  where: { workspaceId: workspaceId, cardKey: { in: aestheticEffectCardKeys } }
               });
               await tx.activeSystemEffect.create({
                  data: {
                    workspaceId: workspaceId,
                    cardKey: instrumentId,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
                  }
               });
            }
        }
        
        const discovery = await tx.instrumentDiscovery.findFirst({
            where: { userId, instrumentId: instrumentId, converted: false }
        });
        
        if (discovery) {
            const dtt = differenceInMinutes(new Date(), discovery.firstViewedAt);
            await tx.instrumentDiscovery.update({
                where: { id: discovery.id },
                data: { converted: true, dtt: dtt > 0 ? dtt : 1 }
            });
        }
        
        return { outcome, boonAmount: Number(boonAmount) };
    });
}
