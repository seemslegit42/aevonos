
/**
 * @fileOverview The Profit Pulse Engine (Codename: KLEPSYDRA) Configuration.
 * These values represent the "Profit Dials" that can be tuned by admins
 * to modulate the system's economic behavior.
 */

export const pulseEngineConfig = {
  /**
   * The target percentage of all ΞCredits the system retains over a 24-hour cycle.
   * The ultimate measure of profitability. Not directly used in calculations, but serves as a target for balancing.
   */
  BASE_RTR: 0.25,

  /**
   * The maximum number of consecutive losses a user can experience
   * before the system intervenes with a "Pity Boon".
   */
  PITY_THRESHOLD: 7,

  /**
   * The percentage drop in system-wide tribute velocity that triggers
   * a global "Festival of Fortune" event to re-engage users.
   */
  FESTIVAL_TRIGGER_PERCENT: 20,
  
  /**
   * The commission fee Obelisk Pay takes on every real-world transmutation via the Proxy.Agent.
   */
  TRANSMUTATION_TITHE: 0.15,
};
