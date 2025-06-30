
'use server';
/**
 * @fileOverview The Profit Pulse Engine (Codename: KLEPSYDRA) Configuration.
 * These values represent the "Profit Dials" that can be tuned by admins
 * to modulate the system's economic behavior.
 */

import prisma from '@/lib/prisma';
import { pulseEngineConfig } from '@/config/pulse-engine-config';
import { PulseProfile, PulsePhase, Prisma } from '@prisma/client';

type PrismaTransactionClient = Omit<Prisma.PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

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
    const phaseOffset = Math.random() * 2 * Math.PI;
    profile = await prisma.pulseProfile.create({
      data: {
        userId,
        phaseOffset,
        baselineLuck: pulseEngineConfig.BASE_LUCK,
        amplitude: 0.15, // Default amplitude for luck oscillation
        frequency: 0.01, // Default frequency for a slow, subtle pulse
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
    lastEventTimestamp,
  } = profile;

  const t = (new Date().getTime() - new Date(lastEventTimestamp).getTime()) / (1000 * 60);

  const luckOscillation = amplitude * Math.sin(2 * Math.PI * frequency * t + phaseOffset);
  const finalLuckWeight = baselineLuck + luckOscillation;
  
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
 * Can be used within a larger Prisma transaction.
 * @param userId The ID of the user who won.
 * @param tx An optional Prisma transaction client.
 */
export async function recordWin(userId: string, tx?: PrismaTransactionClient): Promise<void> {
    const prismaClient = tx || prisma;
    const profile = await getPulseProfile(userId);
    const pulseValue = await getCurrentPulseValue(userId);
    const currentPhase = getPhaseFromValue(pulseValue, profile);

    await prismaClient.pulseProfile.update({
        where: { id: profile.id },
        data: {
            lastEventTimestamp: new Date(),
            consecutiveLosses: 0,
            lastResolvedPhase: currentPhase,
        },
    });
}

/**
 * Records a "loss" for the user, incrementing the consecutive loss counter.
 * Can be used within a larger Prisma transaction.
 * @param userId The ID of the user who lost.
 * @param tx An optional Prisma transaction client.
 */
export async function recordLoss(userId: string, tx?: PrismaTransactionClient): Promise<void> {
    const prismaClient = tx || prisma;
    const profile = await getPulseProfile(userId);
    const pulseValue = await getCurrentPulseValue(userId);
    const currentPhase = getPhaseFromValue(pulseValue, profile);

    await prismaClient.pulseProfile.update({
        where: { id: profile.id },
        data: {
            lastEventTimestamp: new Date(),
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
