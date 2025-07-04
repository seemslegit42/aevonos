
'use server';
/**
 * @fileOverview The Profit Pulse Engine (Codename: KLEPSYDRA) Configuration.
 * These values represent the "Profit Dials" that can be tuned by admins
 * to modulate the system's economic behavior.
 */

import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { getPulseEngineConfig } from './config-service';
import { PulseProfile, PulsePhase, Prisma, PulseInteractionType } from '@prisma/client';

type PrismaTransactionClient = Omit<Prisma.PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

const PULSE_PROFILE_CACHE_KEY = (userId: string) => `pulse-profile:${userId}`;
const PULSE_PROFILE_CACHE_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * Retrieves a user's Pulse Profile, creating a default one if it doesn't exist.
 * This ensures every user is part of the SRE from their first session.
 * This function uses a cache-aside strategy for performance.
 * @param userId The ID of the user.
 * @param tx An optional Prisma transaction client for atomicity.
 * @returns The user's PulseProfile.
 */
async function getPulseProfile(userId: string, tx?: PrismaTransactionClient): Promise<PulseProfile> {
  const prismaClient = tx || prisma;
  const cacheKey = PULSE_PROFILE_CACHE_KEY(userId);

  // Do not use cache if within a transaction
  if (!tx) {
    const cachedProfile = await cache.get(cacheKey);
    if (cachedProfile) {
        // The PulseProfile model has no Decimal types, so it can be parsed directly.
        return cachedProfile as PulseProfile;
    }
  }

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

  if (!tx) {
    await cache.set(cacheKey, profile, 'EX', PULSE_PROFILE_CACHE_TTL_SECONDS);
  }

  return profile;
}

/**
 * Calculates the current "pulse value" for a user. This value, typically between 0 and 1,
 * represents the user's current modulated "luck".
 * @param userId The ID of the user.
 * @param tx An optional Prisma transaction client for atomicity.
 * @returns A luck weight.
 */
export async function getCurrentPulseValue(userId: string, tx?: PrismaTransactionClient): Promise<number> {
  const profile = await getPulseProfile(userId, tx);

  const {
    amplitude,
    frequency,
    phaseOffset,
    baselineLuck,
    lastEventTimestamp,
    frustration,
    flowState,
  } = profile;

  // Time `t` in minutes since the last event
  const t = (new Date().getTime() - new Date(lastEventTimestamp).getTime()) / (1000 * 60);

  // The base sinusoidal pulse
  const luckOscillation = amplitude * Math.sin(2 * Math.PI * frequency * t + phaseOffset);

  // The psychological adjustment layer.
  // High flow state gives a slight boost to luck, rewarding engagement.
  // High frustration also gives a slight boost, acting as a soft "pity" mechanism to prevent churn.
  const psychologicalModifier = (flowState * 0.05) + (frustration * 0.075);

  const finalLuckWeight = baselineLuck + luckOscillation + psychologicalModifier;
  
  // Clamp the luck weight between a reasonable min and max to avoid extreme swings.
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
 * Records a "win" for the user, resetting the time component and consecutive losses,
 * and updating their psychological profile.
 * Implements a write-through caching strategy.
 * @param userId The ID of the user who won.
 * @param tx An optional Prisma transaction client.
 */
export async function recordWin(userId: string, tx?: PrismaTransactionClient): Promise<void> {
    const prismaClient = tx || prisma;
    const profile = await getPulseProfile(userId, tx);
    const pulseValue = await getCurrentPulseValue(userId, tx);
    const currentPhase = getPhaseFromValue(pulseValue, profile);

    const updatedProfile = await prismaClient.pulseProfile.update({
        where: { id: profile.id },
        data: {
            lastEventTimestamp: new Date(),
            consecutiveLosses: 0,
            lastResolvedPhase: currentPhase,
            lastInteractionType: PulseInteractionType.WIN,
            frustration: Math.max(0, profile.frustration - 0.2),
            flowState: Math.min(1, profile.flowState + 0.1),
        },
    });

    if (!tx) {
        await cache.set(PULSE_PROFILE_CACHE_KEY(userId), updatedProfile, 'EX', PULSE_PROFILE_CACHE_TTL_SECONDS);
    }
}

/**
 * Records a "loss" for the user, incrementing the consecutive loss counter and
 * updating their psychological profile.
 * Implements a write-through caching strategy.
 * @param userId The ID of the user who lost.
 * @param tx An optional Prisma transaction client.
 */
export async function recordLoss(userId: string, tx?: PrismaTransactionClient): Promise<void> {
    const prismaClient = tx || prisma;
    const profile = await getPulseProfile(userId, tx);
    const pulseValue = await getCurrentPulseValue(userId, tx);
    const currentPhase = getPhaseFromValue(pulseValue, profile);

    const updatedProfile = await prismaClient.pulseProfile.update({
        where: { id: profile.id },
        data: {
            lastEventTimestamp: new Date(),
            consecutiveLosses: {
                increment: 1,
            },
            lastResolvedPhase: currentPhase,
            lastInteractionType: PulseInteractionType.LOSS,
            frustration: Math.min(1, profile.frustration + 0.15),
            flowState: Math.max(0, profile.flowState - 0.05),
        },
    });
    
    if (!tx) {
        await cache.set(PULSE_PROFILE_CACHE_KEY(userId), updatedProfile, 'EX', PULSE_PROFILE_CACHE_TTL_SECONDS);
    }
}

/**
 * Checks if the user has reached the Pity Boon threshold for consecutive losses.
 * @param userId The ID of the user.
 * @returns True if a Pity Boon should be triggered.
 */
export async function shouldTriggerPityBoon(userId: string, workspaceId: string, tx?: PrismaTransactionClient): Promise<boolean> {
    const profile = await getPulseProfile(userId, tx);
    const config = await getPulseEngineConfig(workspaceId);
    return profile.consecutiveLosses >= config.pityThreshold;
}


/**
 * Returns the full pulse state for a user, including narrative, phase, and value.
 * @param userId The ID of the user.
 * @returns An object with the user's full pulse state.
 */
export async function getUserPulseState(userId: string) {
    const pulseValue = await getCurrentPulseValue(userId);
    const profile = await getPulseProfile(userId);
    const phase = getPhaseFromValue(pulseValue, profile);

    let narrative = "The threads of fate are in balance. All outcomes are your own.";
    if (phase === PulsePhase.CREST) {
        narrative = "The river of fortune swells. Ride it before it turns.";
    } else if (phase === PulsePhase.TROUGH) {
        narrative = "The divine pendulum tilts. Not in your favor, today.";
    }

    return {
        narrative,
        phase,
        value: pulseValue
    };
}

/**
 * Records a generic user interaction, updating psychological metrics.
 * Implements a write-through caching strategy.
 * @param userId The ID of the user.
 * @param type The type of interaction outcome.
 * @param tx An optional Prisma transaction client.
 */
export async function recordInteraction(userId: string, type: 'success' | 'failure', tx?: PrismaTransactionClient): Promise<void> {
    const prismaClient = tx || prisma;
    const profile = await getPulseProfile(userId, tx);

    let updatedProfile: PulseProfile;
    if (type === 'success') {
        updatedProfile = await prismaClient.pulseProfile.update({
            where: { id: profile.id },
            data: {
                lastInteractionType: PulseInteractionType.COMMAND_SUCCESS,
                frustration: Math.max(0, profile.frustration - 0.02), // Small decrease
                flowState: Math.min(1, profile.flowState + 0.01),   // Small increase
            },
        });
    } else { // failure
        updatedProfile = await prismaClient.pulseProfile.update({
            where: { id: profile.id },
            data: {
                lastInteractionType: PulseInteractionType.COMMAND_FAILURE,
                frustration: Math.min(1, profile.frustration + 0.05), // Moderate increase
                flowState: Math.max(0, profile.flowState - 0.1),    // Significant decrease
            },
        });
    }
    
    if (!tx) {
        await cache.set(PULSE_PROFILE_CACHE_KEY(userId), updatedProfile, 'EX', PULSE_PROFILE_CACHE_TTL_SECONDS);
    }
}
