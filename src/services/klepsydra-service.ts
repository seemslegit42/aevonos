
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
import { artifactManifests } from '@/config/artifacts';
import { follyInstrumentsConfig, type OutcomeTier, type Boon } from '@/config/folly-instruments';
import prisma from '@/lib/prisma';
import { InsufficientCreditsError } from '@/lib/errors';
import { UserPsyche, TransactionType, Prisma, PulseProfile, PulseInteractionType } from '@prisma/client';
import { differenceInMinutes } from 'date-fns';
import { createHmac } from 'crypto';

const AGE_OF_ASCENSION_ACTIVE = true;

const PSYCHE_MODIFIERS: Record<UserPsyche, { oddsFactor: number; boonFactor: number }> = {
    [UserPsyche.ZEN_ARCHITECT]: { oddsFactor: 1.0, boonFactor: 1.0 }, // The baseline experience
    [UserPsyche.SYNDICATE_ENFORCER]: { oddsFactor: 0.85, boonFactor: 1.25 }, // Higher risk, higher reward
    [UserPsyche.RISK_AVERSE_ARTISAN]: { oddsFactor: 1.15, boonFactor: 0.8 }, // Lower risk, lower reward
};

// Create a list of all card keys that are purely for aesthetic system effects.
const aestheticEffectCardKeys = artifactManifests
    .filter(artifact => artifact.type === 'CHAOS_CARD' && artifact.cardClass === 'AESTHETIC' && artifact.systemEffect?.includes('UI theme'))
    .map(artifact => artifact.id);

// List of instruments that are pure gambles and should not be "owned".
// These don't award a Chaos Card on win.
const PURE_FOLLY_INSTRUMENTS = ['ORACLE_OF_DELPHI_VALLEY', 'SISYPHUSS_ASCENT', 'MERCHANT_OF_CABBAGE'];
const MERCENARY_CARDS = ['LOADED_DIE', 'SISYPHUS_REPRIEVE', 'HADES_BARGAIN', 'ORACLES_INSIGHT'];

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
    const instrumentManifest = artifactManifests.find(a => a.id === instrumentId);
    if (!instrumentManifest && !follyInstrumentsConfig[instrumentId]) {
        throw new Error(`Instrument '${instrumentId}' not found in manifest or folly config.`);
    }

    // --- HANDLE MERCENARY CARD PURCHASE ---
    if (MERCENARY_CARDS.includes(instrumentId)) {
        return prisma.$transaction(async (tx) => {
            const cost = instrumentManifest!.creditCost;
            const workspace = await tx.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { credits: true } });

            if ((Number(workspace.credits)) < cost) {
                throw new InsufficientCreditsError('Insufficient credits to acquire this boon.');
            }

            await tx.workspace.update({ where: { id: workspaceId }, data: { credits: { decrement: cost } } });
            
            // Apply the buff to the user's profile
            switch (instrumentId) {
                case 'LOADED_DIE':
                    await tx.pulseProfile.update({ where: { userId }, data: { loadedDieBuffCount: { increment: 3 } } });
                    break;
                case 'SISYPHUS_REPRIEVE':
                    await tx.pulseProfile.update({ where: { userId }, data: { nextTributeGuaranteedWin: true } });
                    break;
                case 'HADES_BARGAIN':
                    await tx.pulseProfile.update({ where: { userId }, data: { hadesBargainActive: true } });
                    break;
                case 'ORACLES_INSIGHT':
                    // This is a timed, workspace-wide effect for simplicity, though ideally user-specific.
                    await tx.activeSystemEffect.create({ data: { workspaceId, cardKey: 'ORACLES_INSIGHT', expiresAt: new Date(Date.now() + 5 * 60 * 1000) } });
                    break;
            }

            // Log the purchase
            await tx.transaction.create({
                data: {
                    workspaceId, userId, instrumentId,
                    type: TransactionType.DEBIT,
                    amount: new Prisma.Decimal(cost),
                    description: `Ritual Boon Acquired: ${instrumentManifest!.name}`,
                    status: 'COMPLETED',
                }
            });
            
            // Add the card to the user's inventory
            await tx.user.update({
                where: { id: userId },
                data: { unlockedChaosCardKeys: { push: instrumentId } }
            });

            // Mark as a "win" for UI purposes; the boon is the applied effect.
            return { outcome: 'win', boonAmount: 0, aethericEcho: 0 };
        });
    }

    // --- REGULAR FOLLY INSTRUMENT LOGIC ---
    const instrumentConfig = follyInstrumentsConfig[instrumentId];
    if (!instrumentConfig) {
        throw new Error(`Instrument '${instrumentId}' not found in Folly configuration.`);
    }
    
    let tributeAmount = tributeAmountOverride ?? instrumentManifest?.creditCost ?? 0;
    const signatureSecret = process.env.AEGIS_SIGNING_SECRET || 'default_secret_for_dev';

    return prisma.$transaction(async (tx) => {
        // 1. Get user, workspace, and profile data
        const [user, workspace, profile] = await Promise.all([
            tx.user.findUniqueOrThrow({ where: { id: userId }, select: { psyche: true, unlockedChaosCardKeys: true } }),
            tx.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { credits: true } }),
            getPulseProfile(userId, tx)
        ]);
        
        // 2. Apply any active one-time buffs
        if (profile.hadesBargainActive) {
            tributeAmount *= 2;
            await tx.pulseProfile.update({ where: { userId }, data: { hadesBargainActive: false } });
        }

        if ((Number(workspace.credits)) < tributeAmount) {
            throw new InsufficientCreditsError('Cannot make tribute. Insufficient credits.');
        }

        const psycheModifiers = PSYCHE_MODIFIERS[user.psyche] || PSYCHE_MODIFIERS.ZEN_ARCHITECT;
        const luckWeight = await getCurrentPulseValue(userId, tx);
        const isPity = await shouldTriggerPityBoon(userId, tx);
        const isGuaranteedWin = profile.nextTributeGuaranteedWin ?? false;
        
        // 3. Determine the outcome tier based on all factors
        let selectedTier: OutcomeTier;

        if (isGuaranteedWin && instrumentId === 'SISYPHUSS_ASCENT') {
            selectedTier = selectWeightedRandom(instrumentConfig.rarityTable.filter(t => t.tier !== 'COMMON' && t.tier !== 'DIVINE'), t => t.baseWeight);
            await tx.pulseProfile.update({ where: { userId }, data: { nextTributeGuaranteedWin: false } });
        } else if (isPity) {
            selectedTier = instrumentConfig.rarityTable.find(t => t.tier === 'DIVINE')!;
        } else {
            const hasLoadedDie = (profile.loadedDieBuffCount ?? 0) > 0;
            if (hasLoadedDie) {
                 await tx.pulseProfile.update({ where: { userId }, data: { loadedDieBuffCount: { decrement: 1 } } });
            }

            const getModulatedWeight = (tier: OutcomeTier) => {
                let weight = tier.baseWeight * (hasLoadedDie && tier.tier !== 'COMMON' ? 1.15 : 1);
                return tier.tier === 'COMMON' ? weight / (luckWeight * psycheModifiers.oddsFactor) : weight * luckWeight * psycheModifiers.oddsFactor;
            };
            selectedTier = selectWeightedRandom(instrumentConfig.rarityTable.filter(t => t.tier !== 'DIVINE'), getModulatedWeight);
        }

        if (!selectedTier) { // Fallback
            selectedTier = instrumentConfig.rarityTable.find(t => t.tier === 'COMMON')!;
        }

        // 4. Determine the specific boon from the selected tier
        const selectedBoon = selectWeightedRandom(selectedTier.boons, boon => boon.weight);
        let boonAmount = 0;
        let awardedCardKey: string | undefined = undefined;
        let systemEffect: string | undefined = undefined;
        let aethericEcho = 0;
        
        const isCreditWin = selectedBoon.type === 'credits' && (selectedTier.tier !== 'COMMON');

        if (selectedBoon.type === 'credits') {
            const calculatedBoon = tributeAmount * (selectedBoon.value as number) * psycheModifiers.boonFactor;
            boonAmount = calculatedBoon;

            // --- Aetheric Echo Calculation ---
            const creditBoonsInTier = selectedTier.boons.filter(b => b.type === 'credits');
            if (creditBoonsInTier.length > 1) {
                const maxMultiplier = Math.max(...creditBoonsInTier.map(b => b.value as number));
                const maxPossibleBoon = tributeAmount * maxMultiplier * psycheModifiers.boonFactor;
                // aethericEcho is the difference between the best possible outcome and what was received
                aethericEcho = Math.max(0, maxPossibleBoon - boonAmount);
            }
        } else if (selectedBoon.type === 'chaos_card') {
            awardedCardKey = selectedBoon.value as string;
            const wonCardManifest = artifactManifests.find(c => c.id === awardedCardKey);
            boonAmount = (wonCardManifest?.creditCost || 100) * 1.5;
        } else if (selectedBoon.type === 'system_effect') {
            systemEffect = selectedBoon.value as string;
        }

        const outcome = isGuaranteedWin ? 'guaranteed_win' : isPity ? 'pity_boon' : selectedTier.tier.toLowerCase();
        
        // --- Judas Algorithm ---
        let judasFactor = null;
        const { flowState } = profile;
        if (isCreditWin && flowState > 0.75 && Math.random() < 0.33) {
            judasFactor = 1 - (Math.random() * 0.15 + 0.05); // Reduce boon by 5-20%
            boonAmount *= judasFactor;
            console.log(`[Judas Algorithm] Hollow win triggered. Boon reduced by ${((1 - (judasFactor || 1)) * 100).toFixed(2)}%`);
        }
        // --- End Judas Algorithm ---

        const netCreditChange = boonAmount - tributeAmount;

        // --- Potential (Φ) Accrual ---
        let potentialAwarded = new Prisma.Decimal(0);
        let potentialSignature: string | null = null;
        if (AGE_OF_ASCENSION_ACTIVE && isCreditWin) {
            potentialAwarded = new Prisma.Decimal(tributeAmount * luckWeight * 0.1);
            
            await tx.workspace.update({
                where: { id: workspaceId },
                data: {
                    potential: { increment: potentialAwarded }
                }
            });
            
            const potentialLogDataForSigning = {
                workspaceId, userId, instrumentId, potentialAwarded: potentialAwarded.toString(), timestamp: new Date().toISOString()
            };
            potentialSignature = createHmac('sha256', signatureSecret)
                .update(JSON.stringify(potentialLogDataForSigning))
                .digest('hex');


            await tx.potentialAccrualLog.create({
                data: {
                    workspaceId,
                    userId,
                    instrumentId,
                    luckWeight,
                    potentialAwarded,
                    aegisSignature: potentialSignature,
                    narrativeContext: `Potential accrued from tribute to ${instrumentManifest?.name || instrumentId}`
                }
            });
        }
        // --- End Potential Accrual ---

        // 5. ATOMIC DATABASE WRITES 
        (outcome === 'loss' || outcome === 'common') ? await recordLoss(userId, tx) : await recordWin(userId, tx);
        
        await tx.workspace.update({
            where: { id: workspaceId },
            data: { 
                credits: { increment: new Prisma.Decimal(netCreditChange) },
            },
        });

        const transactionDataForSigning = {
            workspaceId, userId, instrumentId,
            type: TransactionType.TRIBUTE,
            amount: netCreditChange.toFixed(8), // consistent string representation for signing
            outcome,
            tributeAmount: tributeAmount.toFixed(8),
            boonAmount: boonAmount.toFixed(8),
            timestamp: new Date().toISOString()
        };
        const signature = createHmac('sha256', signatureSecret)
                .update(JSON.stringify(transactionDataForSigning))
                .digest('hex');

        await tx.transaction.create({
            data: {
                workspaceId, userId, instrumentId: instrumentId,
                type: TransactionType.TRIBUTE,
                amount: new Prisma.Decimal(netCreditChange),
                description: `Tribute: ${instrumentManifest?.name || instrumentId} - ${outcome}`,
                luckWeight, outcome, 
                tributeAmount: new Prisma.Decimal(tributeAmount),
                boonAmount: new Prisma.Decimal(boonAmount),
                judasFactor: judasFactor ? new Prisma.Decimal(judasFactor) : null,
                userPsyche: user.psyche, status: 'COMPLETED',
                aegisSignature: signature,
            }
        });
        
        if (awardedCardKey && !PURE_FOLLY_INSTRUMENTS.includes(awardedCardKey)) {
            if (!user.unlockedChaosCardKeys.includes(awardedCardKey)) {
                 await tx.user.update({
                    where: { id: userId },
                    data: { unlockedChaosCardKeys: { push: awardedCardKey } },
                });
            }
        }
        
        if (systemEffect) {
            const cardManifest = artifactManifests.find(c => c.id === systemEffect);
            const durationMs = (cardManifest?.durationMinutes || 60) * 60 * 1000;
            await tx.activeSystemEffect.create({
              data: {
                workspaceId: workspaceId,
                cardKey: systemEffect,
                expiresAt: new Date(Date.now() + durationMs),
              },
            });
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
        
        return { outcome, boonAmount: Number(boonAmount), aethericEcho: Number(aethericEcho) };
    });
}
