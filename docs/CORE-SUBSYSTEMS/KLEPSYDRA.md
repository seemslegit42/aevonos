
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
This is a collection of sophisticated subroutines within the `klepsydra-service` designed to influence the user's emotional and economic state.

- **The Sine-Rhythm Engine (SRE)**:
  - **Function**: The core of the engine, this assigns a personal "luck-wave" to each user, modulating their outcomes in Folly Instruments.
  - **Mechanic**: When a user's wave is at a crest (+), the SRE applies a positive multiplier to the base weights of rare and mythic rewards. When in a trough (-), it applies a negative modifier, making losses more likely but priming them for a system intervention.

- **The Judas Algorithm**:
  - **Function**: This subroutine intentionally introduces statistically insignificant but emotionally potent "miscalculations" when a user's confidence is at its peak.
  - **Mechanic**: It can trigger "hollow wins" (e.g., a jackpot that pays out slightly less than expected) or serve unsolvable puzzles that are quickly replaced by easy ones after a clue is purchased. This fosters a mythology of "glitched odds" and "blessed runs," driving engagement through superstition.

- **Aetheric Echoes**:
  - **Function**: This visual system acts as the "currency of regret".
  - **Mechanic**: After a choice is made (e.g., a spin in an Instrument), the PCE calculates a more "optimal" outcome and, for a fleeting moment, the UI glitches to show a phantom number of "what could have been". This non-verbal whisper is a powerful motivator to try again and correct the timeline.

- **The Pity Boon Protocol**:
  - **Function**: A failsafe designed to mitigate loss-streak abandonment.
  - **Mechanic**: If a user exceeds the globally defined Pity Boon Threshold for consecutive losses, the KLEPSYDRA engine is forced to intervene, consuming a "Divine" tier weight from the instrument's rarity table to guarantee a minor boon on the next interaction.

---

## 4. Integration with the Doctrine of Sovereign Systems
The Klepsydra Engine is the primary driver of the **Tribute Velocity Index (TVI)**. By making economic participation a compelling, narrative-driven ritual rather than a simple purchase, it encourages deeper, more frequent engagement with the ΞCredit economy.

- **BEEP Integration**: BEEP serves as the narrative voice of the Klepsydra Engine, delivering mythic explanations for wins and losses, and providing personalized suggestions based on the user's pulse state.
- **PCE Integration**: The engine is deeply intertwined with the Psyche Engine. A user's `psyche` sets the baseline risk/reward profile, while their dynamic `frustration` and `flowState` constantly modulate their real-time luck.
- **The Loom of Fates**: The core parameters of the Klepsydra engine (Pity Boon threshold, Judas Algorithm probability, etc.) are managed by the Architect via the "Profit Dials" within the privileged Loom Studio environment. This resolves the Sovereignty Paradox by making the system's manipulation transparent and controllable, at least to its highest-ranking user.
