# Merchant of Cabbage: Anachronistic Commerce - Technical Specification

> "My Cabbages!"

---

## 1. System Overview

The Merchant of Cabbage is a **gamified Folly Instrument** Micro-App with a humorous, anachronistic theme. Users take on the role of a beleaguered cabbage merchant in an ancient city, making a tribute of ΞCredits to "dispatch their cart" for a chance to turn a profit.

It is an engagement-focused economic tool that adds flavor and variety to the Folly Instrument lineup.

---

## 2. Core Components & Implementation

### 2.1. The `merchant-of-cabbage.tsx` Component
- **Thematic Reels**: The UI features three spinning reels with symbols representing the merchant's fate: `Perfect Cabbage`, `Coin Pouch`, `Sturdy Cart`, `Trampled Cabbage` (loss), and `Praetorian Guard` (jackpot).
- **Tribute Input**: A standard interface for the user to set their tribute amount and dispatch their cart.
- **Outcome Visualization**: The reels spin to reveal the outcome. A winning combination results in a "Profitable Day" alert and a boon of ΞCredits. A losing combination triggers the infamous "MY CABBAGES!!" alert.

### 2.2. The `klepsydra-service.ts`
- **Centralized Logic**: The "dispatch" action calls the `makeFollyTribute` server action, which orchestrates the outcome via the `klepsydra-service`.
- **Outcome Calculation**: The service uses the instrument's specific `rarityTable` from `config/folly-instruments.ts`, modulated by the user's `PulseProfile` (their luck state), to determine the win/loss outcome and the size of any boon.
- **Atomic Transactions**: The service ensures that the tribute is debited and any boon is credited in a single, atomic transaction on the `Obelisk Pay` ledger.

---

## 3. Integration with ΛΞVON OS

- **Economic Engine**: Serves as a key interface for the `Klepsydra Engine`, providing another engaging avenue for users to participate in the ΞCredit economy.
- **Narrative Flavor**: Adds a lighthearted, humorous element to the OS, balancing the more serious and intense themes of other components. It demonstrates the flexibility of the Folly Instrument framework.
- **Architectural Role**: Like other Folly Instruments, it is a vital tool for driving the Tribute Velocity Index (TVI) and enhancing user retention through gamified economic loops.