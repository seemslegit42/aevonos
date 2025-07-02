
# The Oracle of Delphi (Valley): A Folly Instrument - Technical Specification

> "Make your offering. Learn your fate."

---

## 1. System Overview

The Oracle of Delphi (Valley) is a **Folly Instrument Micro-App**, a core component of the Klepsydra Engine's gamified economic layer. It is a game of chance themed around the high-stakes world of venture capital, where users make a "tribute" of ΞCredits for a chance to receive a "boon" from the Oracle.

It is designed to be a compelling, high-affinity credit sink that drives engagement with the platform's internal economy.

---

## 2. Core Components & Implementation

### 2.1. The `OracleOfDelphiValley` Micro-App (`micro-apps/oracle-of-delphi-valley.tsx`)
The UI is an interactive, animated "slot machine" that represents the user's venture capital journey.
- **Tribute Input**: An `Input` allows the user to specify the amount of ΞCredits they wish to tribute.
- **Reels Display**: Three animated "reels" display a series of symbols (`ROCKS`, `SCROLL`, `VOLCANO`, `UNICORN`, `LAUREL`), each representing a stage of a startup's life, from a seed round to an IPO.
- **Execution**: A "Make Tribute" button triggers the `makeFollyTribute` server action.

### 2.2. The `makeFollyTribute` Server Action (`app/actions.ts`)
- **Purpose**: This action serves as the bridge between the UI and the backend economic services.
- **Logic**: It calls the `processFollyTribute` function from the `klepsydra-service`, passing the user's ID, workspace ID, the instrument ID (`ORACLE_OF_DELPHI_VALLEY`), and the `tributeAmount`. It then returns the result to the client.

### 2.3. The `klepsydra-service` (`services/klepsydra-service.ts`)
- **Outcome Calculation**: This is where the core logic resides. The service retrieves the user's `PulseProfile` and `psyche`, calculates their current `luckWeight`, determines the final odds of a win, and rolls to determine the outcome (`win`, `loss`, or `pity_boon`).
- **Ledger Integration**: The `processFollyTribute` function atomically records the transaction, ensuring the user's credit balance is updated correctly and an immutable record is created.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Oracle is a standard Micro-App that can be launched from the Canvas or The Armory.
- **Economic Engine**: As a Folly Instrument, it is a primary driver of the **Tribute Velocity Index (TVI)**, a key metric for measuring user engagement with the ΞCredit economy.
- **Psyche-Awareness**: The odds and potential rewards of the Oracle are subtly modulated by the user's chosen `psyche`, making the experience feel personalized and reinforcing their chosen identity within the OS.
