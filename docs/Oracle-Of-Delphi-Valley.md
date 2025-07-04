# Oracle of Delphi (Valley): The Folly of Venture Capital - Technical Specification

> "Make your tribute to the Oracle. Learn your fate in the market."

---

## 1. System Overview

The Oracle of Delphi (Valley) is a **gamified Folly Instrument** Micro-App, themed around the high-stakes world of venture capital and startups. It allows users to make a "tribute" (spend ΞCredits) for a chance to receive a "boon" (a larger return of ΞCredits), with the outcome determined by the `Klepsydra Engine`.

It is a primary driver of economic engagement, transforming the act of spending into a compelling, narrative-driven ritual of risk and reward.

---

## 2. Core Components & Implementation

### 2.1. The `oracle-of-delphi-valley.tsx` Component
- **Thematic Reels**: The UI features three "reels" that spin to reveal the outcome. Instead of fruit, the symbols are thematic to venture capital: `Rocks` (Seed Round), `Scroll` (Term Sheet), `Volcano` (Burn Rate), `Unicorn` (1B+ Valuation), and `Laurel` (The Exit/IPO).
- **Tribute Input**: An input field allows the user to specify their tribute amount, with a button to "Make Tribute."
- **Outcome Visualization**: On tribute, the reels spin and land on a combination of symbols representing the outcome (e.g., three Volcanoes for a loss, three Laurels for a jackpot). A clear alert message announces the result and the boon amount, if any.
- **Aetheric Echo**: The UI is capable of displaying a fleeting, ghostly number representing a "near miss" on a larger prize, a key psychological mechanic of the `Klepsydra Engine`.

### 2.2. The `klepsydra-service.ts`
- **Centralized Logic**: The core logic is not in the component. The "Make Tribute" button calls the `makeFollyTribute` server action.
- **Outcome Calculation**: The `processFollyTribute` function within the `klepsydra-service` calculates the outcome. It retrieves the user's `PulseProfile`, applies luck and psyche modifiers to the instrument's baseline `rarityTable` (defined in `config/folly-instruments.ts`), and determines the final win/loss state and boon amount.
- **Atomic Transactions**: The service ensures that debiting the tribute and crediting any boon is an atomic operation on the `Obelisk Pay` ledger, preventing any inconsistencies.

---

## 3. Integration with ΛΞVON OS

- **Economic Engine**: This Folly Instrument is a key interface for the `Klepsydra Engine`, driving the Tribute Velocity Index (TVI) and providing data for the `Psyche-Engine`.
- **Architectural Role**: It serves as a powerful monetization and engagement tool, turning a simple economic transaction into a narrative experience