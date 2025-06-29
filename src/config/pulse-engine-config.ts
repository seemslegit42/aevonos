
/**
 * @fileOverview The Profit Pulse Engine (Codename: KLEPSYDRA) Configuration.
 * These values represent the "Profit Dials" that can be tuned by admins
 * to modulate the system's economic behavior.
 */

export const pulseEngineConfig = {
  /**
   * The baseline probability for a "win" event before modulation.
   * Represents the raw, unadjusted odds.
   */
  BASE_LUCK: 0.5,

  /**
   * Target Tribute Velocity Ratio (unused in initial implementation).
   * The desired rate of credit expenditure per minute per user.
   */
  TARGET_TVR: 1.25,

  /**
   * The maximum number of consecutive losses a user can experience
   * before the system intervenes with a "Pity Boon".
   */
  PITY_THRESHOLD: 6,

  /**
   * The percentage drop in system-wide tribute velocity that triggers
   * a global "Festival of Fortune" event to re-engage users.
   */
  CRASH_GUARD_PERCENT: 20,

  /**
   * A multiplier for how much more sensitive a user is to receiving a
   * "Boon" (a near-miss or small win) after hitting a jackpot.
   */
  SENSITIVITY_MODIFIER: 1.5,
};
