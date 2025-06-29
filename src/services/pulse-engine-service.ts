
'use server';
/**
 * @fileOverview The Profit Pulse Engine (Codename: KLEPSYDRA).
 * This service implements the Sine-Rhythm Engine (SRE) to modulate
 * user "luck" over time, creating a more engaging and profitable economic loop.
 */

import prisma from '@/lib/prisma';
import { pulseEngineConfig } from '@/config/pulse-engine-config';
import { PulseProfile, PulsePhase } from '@prisma/client';

/**
 * Retrieves a user's Pulse Profile, creating a default one if it doesn't exist.
 * This ensures every user is part of the SRE from their first session.
 * @param userId The ID of the user.
 * @returns The user's PulseProfile.
 */
async function getPulseProfile(userId: string): Promise<PulseProfile> {
  let profile = await prisma.pulseProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    // Assign a random phase offset to de-sync user patterns from the start.
    const phaseOffset = Math.random() * 2 * Math.PI;
    profile = await prisma.pulseProfile.create({
      data: {
        userId,
        phaseOffset,
        baselineLuck: pulseEngineConfig.BASE_LUCK,
      },
    });
  }

  return profile;
}

/**
 * Calculates the current "pulse value" for a user. This value, typically between 0 and 1,
 * represents the user's current modulated "luck".
 * @param userId The ID of the user.
 * @returns A luck weight.
 */
export async function getCurrentPulseValue(userId: string): Promise<number> {
  const profile = await getPulseProfile(userId);

  const {
    amplitude,
    frequency,
    phaseOffset,
    baselineLuck,
    lastWinTimestamp,
  } = profile;

  // t = time since last win in minutes
  const t = (new Date().getTime() - new Date(lastWinTimestamp).getTime()) / (1000 * 60);

  // The Sine-Rhythm Engine (SRE) formula
  const luckOscillation = amplitude * Math.sin(2 * Math.PI * frequency * t + phaseOffset);
  const finalLuckWeight = baselineLuck + luckOscillation;
  
  // Clamp the result to a reasonable range (e.g., 0.05 to 0.95) to avoid guaranteed wins/losses.
  return Math.max(0.05, Math.min(0.95, finalLuckWeight));
}

function getPhaseFromValue(pulseValue: number, profile: PulseProfile): PulsePhase {
    const { baselineLuck, amplitude } = profile;
    const troughThreshold = baselineLuck - (amplitude * 0.5);
    const crestThreshold = baselineLuck + (amplitude * 0.5);
    if (pulseValue > crestThreshold) return PulsePhase.CREST;
    if (pulseValue < troughThreshold) return PulsePhase.TROUGH;
    return PulsePhase.EQUILIBRIUM;
}

/**
 * Determines if the user's pulse is currently in a "crest" phase (high luck).
 * @param userId The ID of the user.
 * @returns True if the user is in a crest phase.
 */
export async function isInCrestPhase(userId: string): Promise<boolean> {
    const pulseValue = await getCurrentPulseValue(userId);
    const profile = await getPulseProfile(userId);
    return getPhaseFromValue(pulseValue, profile) === PulsePhase.CREST;
}

/**
 * Records a "win" for the user, resetting the time component and consecutive losses.
 * @param userId The ID of the user who won.
 */
export async function recordWin(userId: string): Promise<void> {
    const profile = await getPulseProfile(userId);
    const pulseValue = await getCurrentPulseValue(userId);
    const currentPhase = getPhaseFromValue(pulseValue, profile);

    await prisma.pulseProfile.update({
        where: { id: profile.id },
        data: {
            lastWinTimestamp: new Date(),
            consecutiveLosses: 0,
            lastResolvedPhase: currentPhase,
        },
    });
}

/**
 * Records a "loss" for the user, incrementing the consecutive loss counter.
 * @param userId The ID of the user who lost.
 */
export async function recordLoss(userId: string): Promise<void> {
    const profile = await getPulseProfile(userId);
    const pulseValue = await getCurrentPulseValue(userId);
    const currentPhase = getPhaseFromValue(pulseValue, profile);

    await prisma.pulseProfile.update({
        where: { id: profile.id },
        data: {
            consecutiveLosses: {
                increment: 1,
            },
            lastResolvedPhase: currentPhase,
        },
    });
}

/**
 * Checks if the user has reached the Pity Boon threshold for consecutive losses.
 * @param userId The ID of the user.
 * @returns True if a Pity Boon should be triggered.
 */
export async function shouldTriggerPityBoon(userId: string): Promise<boolean> {
    const profile = await getPulseProfile(userId);
    return profile.consecutiveLosses >= pulseEngineConfig.PITY_THRESHOLD;
}

/**
 * Returns a poetic, narrative string describing the user's current pulse phase.
 * @param userId The ID of the user.
 * @returns A string with the pulse narrative.
 */
export async function getPulseNarrative(userId: string): Promise<string> {
    const pulseValue = await getCurrentPulseValue(userId);
    const profile = await getPulseProfile(userId);
    const phase = getPhaseFromValue(pulseValue, profile);
    
    switch (phase) {
        case PulsePhase.CREST:
            return "The river of fortune swells. Ride it before it turns.";
        case PulsePhase.TROUGH:
            return "The divine pendulum tilts. Not in your favor, today.";
        case PulsePhase.EQUILIBRIUM:
            return "The threads of fate are in balance. All outcomes are your own.";
    }
}
