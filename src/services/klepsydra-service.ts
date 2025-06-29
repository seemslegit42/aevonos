
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
import { logTributeEvent, LogTributeEventInput } from './ledger-service';
import { pulseEngineConfig } from '@/config/pulse-engine-config';
import { chaosCardManifest } from '@/config/chaos-cards';
import prisma from '@/lib/prisma';
import { InsufficientCreditsError } from '@/lib/errors';
import { UserPsyche } from '@prisma/client';

// A simple map for instrument base odds and multipliers.
// In a real system, this would be more sophisticated.
const INSTRUMENT_CONFIG: Record<string, { baseOdds: number; winMultiplier: number }> =
  chaosCardManifest.reduce((acc, card) => {
    acc[card.key] = {
      baseOdds: Math.max(0.05, 1 - card.cost / 2000), // Simple inverse relation to cost
      winMultiplier: 1.5 + card.cost / 500, // Higher cost, higher reward
    };
    return acc;
  }, {} as Record<string, { baseOdds: number; winMultiplier: number }>);

// Define modifiers for each psyche. This is the core of the Psyche-Cohort Targeting Engine.
const PSYCHE_MODIFIERS: Record<UserPsyche, { oddsFactor: number; boonFactor: number }> = {
    [UserPsyche.ZEN_ARCHITECT]: { oddsFactor: 1.0, boonFactor: 1.0 }, // The baseline experience
    [UserPsyche.SYNDICATE_ENFORCER]: { oddsFactor: 0.85, boonFactor: 1.25 }, // Higher risk, higher reward
    [UserPsyche.RISK_AVERSE_ARTISAN]: { oddsFactor: 1.15, boonFactor: 0.8 }, // Lower risk, lower reward
};


/**
 * Calculates the outcome of a Folly Instrument tribute, logs it, and updates the user's pulse.
 * @param userId The user making the tribute.
 * @param workspaceId The user's workspace.
 * @param instrumentId The key of the Folly Instrument being used (e.g., a Chaos Card key).
 * @param tributeAmount The amount of credits being tributed.
 * @returns The final outcome of the event.
 */
export async function calculateOutcome(
  userId: string,
  workspaceId: string,
  instrumentId: string,
  tributeAmount: number
) {
  // 1. Authorize tribute and get user psyche
  const [user, workspace] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { psyche: true },
    }),
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { credits: true },
    }),
  ]);

  if (!user) {
    throw new Error('User not found.');
  }

  if (!workspace || (workspace.credits as unknown as number) < tributeAmount) {
    throw new InsufficientCreditsError('Cannot make tribute. Insufficient credits.');
  }

  // Fetch base instrument configuration
  const instrument = INSTRUMENT_CONFIG[instrumentId] || { baseOdds: 0.5, winMultiplier: 2 };

  // Phase IV: Psyche-Cohort Targeting
  // Modulate the instrument's core properties based on the user's psychological profile.
  const modifiers = PSYCHE_MODIFIERS[user.psyche] || PSYCHE_MODIFIERS.ZEN_ARCHITECT;
  const modifiedBaseOdds = instrument.baseOdds * modifiers.oddsFactor;
  const modifiedWinMultiplier = instrument.winMultiplier * modifiers.boonFactor;

  // 2. Fetch profile & calculate luck
  const luckWeight = await getCurrentPulseValue(userId);
  const finalOdds = Math.max(0, Math.min(1, modifiedBaseOdds * luckWeight));
  
  // 3. Determine outcome
  let outcome = 'loss';
  let boonAmount = 0;
  const isPity = await shouldTriggerPityBoon(userId);
  
  if (isPity) {
    outcome = 'pity_boon';
    boonAmount = tributeAmount * 0.5; // Give back half the tribute
    await recordWin(userId); // A pity boon counts as a "win" to reset the loss streak
  } else if (Math.random() < finalOdds) {
    outcome = 'win';
    boonAmount = tributeAmount * modifiedWinMultiplier; // Use the psyche-modified multiplier
    await recordWin(userId);
  } else {
    await recordLoss(userId);
  }

  const tributeData: LogTributeEventInput = {
    userId,
    workspaceId,
    instrumentId,
    tributeAmount,
    luckWeight,
    outcome,
    boonAmount,
    userPsyche: user.psyche,
  };

  // 4. Log the tribute transaction atomically
  await logTributeEvent(tributeData);

  // 5. Return result
  return {
    outcome,
    boonAmount,
    luckWeight,
    finalOdds,
  };
}
