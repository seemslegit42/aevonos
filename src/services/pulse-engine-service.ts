'use server';
/**
 * @fileOverview The Profit Pulse Engine (Codename: KLEPSYDRA).
 * This service implements the Sine-Rhythm Engine (SRE) to modulate
 * user "luck" over time, creating a more engaging and profitable economic loop.
 */

import prisma from '@/lib/prisma';
import { pulseEngineConfig } from '@/config/pulse-engine-config';
import type { PulseProfile } from '@prisma/client';

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
      },
    });
  }

  return profile;
}

/**
 * Calculates the current "luck weight" for a user based on their Pulse Profile.
 * Luck(t) = BaseLuck + A * sin(2πft + φ)
 * @param userId The ID of the user.
 * @returns A luck weight, typically between 0 and 1, but can exceed it.
 */
export async function calculateLuckWeight(userId: string): Promise<number> {
  const profile = await getPulseProfile(userId);

  const {
    amplitude,
    frequency,
    phaseOffset,
    lastWinTimestamp,
  } = profile;

  // t = time since last win in minutes
  const t = (new Date().getTime() - new Date(lastWinTimestamp).getTime()) / (1000 * 60);

  // The Sine-Rhythm Engine (SRE) formula
  const luckOscillation = amplitude * Math.sin(2 * Math.PI * frequency * t + phaseOffset);

  const finalLuckWeight = pulseEngineConfig.BASE_LUCK + luckOscillation;
  
  // Clamp the result to a reasonable range (e.g., 0.05 to 0.95) to avoid guaranteed wins/losses.
  return Math.max(0.05, Math.min(0.95, finalLuckWeight));
}

/**
 * Records a "win" for the user, resetting the time component of the SRE calculation.
 * This should be called after any event considered a "win" by an Instrument of Folly.
 * @param userId The ID of the user who won.
 * @returns The updated PulseProfile.
 */
export async function recordWin(userId: string): Promise<PulseProfile> {
    const profile = await getPulseProfile(userId);
    return prisma.pulseProfile.update({
        where: { id: profile.id },
        data: {
            lastWinTimestamp: new Date(),
        },
    });
}
