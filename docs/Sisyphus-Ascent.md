# Sisyphus's Ascent: The Absurdist Gamble - Technical Specification

> "One must imagine Sisyphus happy. And perhaps, profitable."

---

## 1. System Overview

Sisyphus's Ascent is a **gamified Folly Instrument** Micro-App with a philosophical twist. Themed around the myth of Sisyphus, it challenges the user to "push" a boulder up a hill by making a tribute of ΞCredits. The outcome, a "reprieve" (a boon of more credits) or a "slip" (a loss), is determined by the `Klepsydra Engine`.

It is a core part of the gamified economy, designed to explore themes of persistence, fate, and the acceptance of absurd challenges.

---

## 2. Core Components & Implementation

### 2.1. The `sisyphus-ascent.tsx` Component
- **Thematic Reels**: The UI features three "reels" that represent the struggle. The symbols are: `Boulder`, `Slip`, `Rest`, and `Peak`.
- **Tribute Input**: A simple interface for the user to input their tribute amount and click a "Push" button.
- **Outcome Visualization**: On "Push," the reels spin. Three `Peak` symbols represent the jackpot, while any `Slip` symbol results in a loss. An alert message communicates the outcome thematically ("The boulder slips," "A moment of reprieve").

### 2.2. The `klepsydra-service.ts`
- **Server-Side Logic**: As with all Folly Instruments, the logic resides entirely within the `klepsydra-service`.
- **Outcome Calculation**: The service uses the user's `PulseProfile` and the instrument's unique `rarityTable` from `config/folly-instruments.ts` to calculate a win/loss outcome.
- **Pity Boon Integration**: This instrument is a prime candidate for the "Pity Boon" mechanic. After a configurable number of consecutive losses, the service can force a small win to prevent user burnout and reward persistence.

---

## 3. Integration with ΛΞVON OS

- **Economic Engine**: A key interface for the `Klepsydra Engine`, driving economic activity and user engagement.
- **Psychological UX**: The app's theme and mechanics directly engage with the `Psyche-Engine`. A user's `frustration` level, tracked in their `PulseProfile`, can directly influence the odds, making the system feel responsive to their emotional state.
- **Architectural Role**: It serves as a powerful example of how ΛΞVON OS transforms simple mechanics into deep, narrative-driven rituals that enhance monetization and user retention.