
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
import { chaosCardManifest } from '@/config/chaos-cards';
import { follyInstrumentsConfig, type OutcomeTier, type Boon } from '@/config/folly-instruments';
import prisma from '@/lib/prisma';
import { InsufficientCreditsError } from '@/lib/errors';
import { UserPsyche, TransactionType, Prisma, PulseProfile } from '@prisma/client';
import { differenceInMinutes } from 'date-fns';

const AGE_OF_ASCENSION_ACTIVE = true;

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
// These don't award a Chaos Card on win.
const PURE_FOLLY_INSTRUMENTS = ['ORACLE_OF_DELPHI_VALLEY', 'SISYPHUSS_ASCENT', 'MERCHANT_OF_CABBAGE'];

type PrismaTransactionClient = Omit<Prisma.PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

/**
 * Retrieves a user's Pulse Profile, creating a default one if it doesn't exist.
 * @param userId The ID of the user.
 * @param tx An optional Prisma transaction client for atomicity.
 * @returns The user's PulseProfile.
 */
async function getPulseProfile(userId: string, tx?: PrismaTransactionClient): Promise<PulseProfile> {
  const prismaClient = tx || prisma;
  let profile = await prismaClient.pulseProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    const phaseOffset = Math.random() * 2 * Math.PI;
    profile = await prismaClient.pulseProfile.create({
      data: {
        userId,
        phaseOffset,
        baselineLuck: 0.4,
        amplitude: 0.15,
        frequency: 0.01,
      },
    });
  }

  return profile;
}

/**
 * A helper function to perform weighted random selection.
 * @param items An array of items to choose from.
 * @param getWeight A function that returns the weight for a given item.
 * @returns The selected item.
 */
function selectWeightedRandom<T>(items: T[], getWeight: (item: T) => number): T {
    const totalWeight = items.reduce((sum, item) => sum + getWeight(item), 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
        const weight = getWeight(item);
        if (random < weight) {
            return item;
        }
        random -= weight;
    }
    
    // Fallback to the last item in case of floating point inaccuracies
    return items[items.length - 1];
}


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
    const instrumentConfig = follyInstrumentsConfig[instrumentId];
    const instrumentManifest = chaosCardManifest.find(card => card.key === instrumentId);

    if (!instrumentConfig || !instrumentManifest) {
        throw new Error(`Instrument '${instrumentId}' not found in configuration.`);
    }
    
    const tributeAmount = tributeAmountOverride ?? instrumentManifest.cost;

    return prisma.$transaction(async (tx) => {
        // --- 1. PRE-CHECK AND GET MODIFIERS ---
        const [user, workspace, profile] = await Promise.all([
            tx.user.findUniqueOrThrow({ where: { id: userId }, select: { psyche: true } }),
            tx.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { credits: true } }),
            getPulseProfile(userId, tx)
        ]);

        if ((workspace.credits as unknown as number) < tributeAmount) {
            throw new InsufficientCreditsError('Cannot make tribute. Insufficient credits.');
        }

        const psycheModifiers = PSYCHE_MODIFIERS[user.psyche] || PSYCHE_MODIFIERS.ZEN_ARCHITECT;
        const luckWeight = await getCurrentPulseValue(userId, tx);
        const isPity = await shouldTriggerPityBoon(userId, tx);
        const isGuaranteedWin = profile.nextTributeGuaranteedWin ?? false;
        
        // --- 2. DETERMINE OUTCOME TIER ---
        let selectedTier: OutcomeTier;

        if (isGuaranteedWin) {
            selectedTier = instrumentConfig.rarityTable.find(t => t.tier === 'RARE')!;
            // Unset the flag now that it's been consumed
            await tx.pulseProfile.update({
                where: { userId },
                data: { nextTributeGuaranteedWin: false }
            });
        } else if (isPity) {
            selectedTier = instrumentConfig.rarityTable.find(t => t.tier === 'DIVINE')!;
        } else {
            // Modulate weights based on luck and psyche
            const getModulatedWeight = (tier: OutcomeTier) => {
                if (tier.tier === 'COMMON') {
                    // Luck weight inversely affects common outcomes
                    return tier.baseWeight / (luckWeight * psycheModifiers.oddsFactor);
                }
                // Luck weight positively affects better outcomes
                return tier.baseWeight * luckWeight * psycheModifiers.oddsFactor;
            };
            selectedTier = selectWeightedRandom(instrumentConfig.rarityTable.filter(t => t.tier !== 'DIVINE'), getModulatedWeight);
        }

        if (!selectedTier) { // Fallback, should not happen
            selectedTier = instrumentConfig.rarityTable.find(t => t.tier === 'COMMON')!;
        }

        // --- 3. DETERMINE BOON ---
        const selectedBoon = selectWeightedRandom(selectedTier.boons, boon => boon.weight);
        let boonAmount = 0;
        let potentialChange = 0;
        let awardedCardId: string | undefined = undefined;
        let systemEffect: string | undefined = undefined;
        
        if (selectedBoon.type === 'credits') {
            const calculatedBoon = tributeAmount * (selectedBoon.value as number) * psycheModifiers.boonFactor;
            if (AGE_OF_ASCENSION_ACTIVE) {
                potentialChange = calculatedBoon;
            } else {
                boonAmount = calculatedBoon;
            }
        } else if (selectedBoon.type === 'chaos_card') {
            awardedCardId = selectedBoon.value as string;
            const wonCardManifest = chaosCardManifest.find(c => c.key === awardedCardId);
            boonAmount = (wonCardManifest?.cost || 100) * 1.5;
        } else if (selectedBoon.type === 'system_effect') {
            systemEffect = selectedBoon.value as string;
        }

        const outcome = isGuaranteedWin ? 'guaranteed_win' : isPity ? 'pity_boon' : selectedTier.tier.toLowerCase();
        const netCreditChange = boonAmount - tributeAmount;

        // --- 4. ATOMIC DATABASE WRITES ---
        if (outcome === 'loss' || outcome === 'common') {
            await recordLoss(userId, tx);
        } else {
            await recordWin(userId, tx);
        }

        await tx.workspace.update({
            where: { id: workspaceId },
            data: { 
                credits: { increment: new Prisma.Decimal(netCreditChange) },
                potential: { increment: new Prisma.Decimal(potentialChange) }
            },
        });

        await tx.transaction.create({
            data: {
                workspaceId, userId, instrumentId: instrumentId,
                type: TransactionType.TRIBUTE,
                amount: new Prisma.Decimal(netCreditChange),
                potentialChange: new Prisma.Decimal(potentialChange),
                description: `Tribute: ${instrumentManifest.name} - ${outcome}`,
                luckWeight, outcome, 
                tributeAmount: new Prisma.Decimal(tributeAmount),
                boonAmount: new Prisma.Decimal(boonAmount),
                userPsyche: user.psyche, status: 'COMPLETED',
            }
        });

        // Award the card if it was won (and ownable)
        if (awardedCardId && !PURE_FOLLY_INSTRUMENTS.includes(awardedCardId)) {
            const cardInDb = await tx.chaosCard.findUnique({ where: { key: awardedCardId } });
            if (cardInDb) {
                 await tx.user.update({
                    where: { id: userId },
                    data: { ownedChaosCards: { connect: { id: cardInDb.id } } },
                });
            }
        }
        
        // Handle system effects
        if (systemEffect) {
            if (aestheticEffectCardKeys.includes(instrumentId)) {
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
            } else if (systemEffect === 'PSYCHE_MATRIX_RESONANCE') {
                await tx.pulseProfile.update({
                    where: { userId },
                    data: { unlockedMatrixPatterns: { push: 'RESONANCE_BURST_01' }}
                })
            } else if (systemEffect === 'SISYPHUS_REPRIEVE') {
                 await tx.pulseProfile.update({
                    where: { userId },
                    data: { nextTributeGuaranteedWin: true }
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
