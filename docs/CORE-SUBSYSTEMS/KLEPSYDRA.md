
# The Klepsydra Engine: The Profit Pulse

> “Time is not a river. It is a tide. And we are the moon.”

---

## 1. System Overview

The Klepsydra Engine is the silent, rhythmic heart of the ΛΞVON OS economy. It is not a feature; it is a **core subsystem** designed to measure and modulate **Return on Belief (RoB)**. Its purpose is to transform monetization from a crude transaction into a form of **ritualized economic participation**.

Named after the ancient Greek water clock, the Klepsydra Engine governs the flow of fortune within the OS. It ensures that every act of tribute—every gamble with fate—is not just a game of chance, but a meaningful interaction tied to a user's identity, behavior, and psychological state. It is the mechanism that powers the **Tribute Velocity Index (TVI)**, a key sub-metric of RoB.

> It is the invisible hand that makes belief profitable.

## 2. Mental Model

> Klepsydra is the god of fortune in the machine. It is the invisible hand that tunes luck and risk across the OS, ensuring that every gamble feels fated, not random. It has no UI; its presence is only felt through the outcomes of the Folly Instruments it governs.

---

## 3. Core Components

### 3.1. The Pulse Profile (`PulseProfile` model)
Every user is silently and automatically assigned a `PulseProfile`. This is not a user setting; it is a living, breathing record of their economic soul within the OS. It contains:
- **`baselineLuck`**: A starting probability anchor.
- **`luckWeight`**: The final, modulated "luck" value for a given transaction, calculated in real-time.
- **`consecutiveLosses`**: A counter that triggers the Pity Boon protocol.
- **`lastEventTimestamp`**: The timestamp of their last tribute, used to calculate the time decay component of the pulse.
- **`phaseOffset`**: A unique value assigned at creation to ensure user pulses are not synchronized, creating a more organic and unpredictable system-wide rhythm.
- **`lastResolvedPhase`**: The user's phase (Crest, Trough, Equilibrium) at the end of their last interaction.
- **Dynamic Psychological State**: Fields like `frustration` and `flowState` track the user's current emotional state, directly influencing the `luckWeight` calculation.

### 3.2. Instruments of Folly (Micro-Apps & Chaos Cards)
These are the designated points of interaction with the Klepsydra Engine. They are the only places where a user can make a "tribute" and test their fate.
- **Chaos Cards**: Purchasable from The Armory, each card is a Folly Instrument with its own base odds and reward multipliers.
- **The Oracle of Delphi (Valley)**: A dedicated Micro-App for making variable tributes.
- **Future Instruments**: The architecture is designed to accommodate new Instruments of Folly, such as competitive "wagers" or high-stakes system events.

### 3.3. The Algorithm of Fate (`klepsydra-service.ts`)
This is the server-side logic that determines the outcome of every tribute. It is a black box to the user, but its logic is transparent to the Architect:
1.  **Invokes `processFollyTribute`**: This is the single, unified function that orchestrates the entire tribute process.
2.  **Retrieves** the user's `PulseProfile`, including their dynamic psychological state.
3.  **Calculates** the current `luckWeight` based on a sinusoidal pulse wave, incorporating time decay, phase offset, and psychological modifiers (`frustration`, `flowState`).
4.  **Applies Archetype Modifiers**: The user's chosen `psyche` (Zen Architect, etc.) applies a multiplier to the base odds and potential boon amount, tuning the risk/reward profile.
5.  **Checks for Pity Boon**: If `consecutiveLosses` exceeds the `PITY_THRESHOLD`, it overrides the odds and forces a small win to prevent user burnout.
6.  **Triggers Judas Algorithm**: If the user is in a high `flowState`, there is a chance to trigger a "hollow win"—a slightly reduced jackpot—to engineer superstition and prevent hubris.
7.  **Determines Outcome**: A random roll against the final, modulated odds determines a `win` or `loss`.
8.  **Executes Atomic Transaction**: All database changes—updating the user's pulse profile, debiting the tribute, crediting any boon, and logging the immutable `TRIBUTE` transaction—are performed in a single, atomic database transaction to ensure perfect ledger consistency.

---

## 4. Integration with the Doctrine of Sovereign Systems
The Klepsydra Engine is the primary driver of the **Tribute Velocity Index (TVI)**. By making economic participation a compelling, narrative-driven ritual rather than a simple purchase, it encourages deeper, more frequent engagement with the ΞCredit economy.

- **BEEP Integration**: BEEP serves as the narrative voice of the Klepsydra Engine, delivering mythic explanations for wins and losses, and providing personalized suggestions based on the user's pulse state.
- **PCE Integration**: The engine is deeply intertwined with the Psyche Engine. A user's `psyche` sets the baseline risk/reward profile, while their dynamic `frustration` and `flowState` constantly modulate their real-time luck.

The Klepsydra Engine is not a slot machine. It is a carefully calibrated system designed to make **belief** the most valuable currency in ΛΞVON OS.
