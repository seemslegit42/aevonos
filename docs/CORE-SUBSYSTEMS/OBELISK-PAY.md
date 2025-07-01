
# Obelisk Pay: Sovereign Ledger & Transaction Engine

> “A monument to sovereignty. A burial site for third-party fees.”

---

## 1. System Overview

Obelisk Pay is the **sovereign, closed-loop payment and transaction engine** for ΛΞVON OS. It provides the foundational infrastructure for all value exchange within a workspace, using internal credits (**ΞCredits**) as the sole currency of record.

This system is architected for **absolute financial sovereignty**, eliminating reliance on external processors like Stripe or PayPal for core operations. All logic is handled by the `ledger-service`, which ensures atomic, auditable, and precise management of ΞCredits.

## 2. Mental Model

> Obelisk Pay is the sovereign central bank and treasury of ΛΞVON OS. It doesn't have a UI; it *is* the ledger. Its presence is felt through the `Usage Monitor` Micro-App and every transaction that debits or credits a workspace's ΞCredit balance.

---

## 3. Core Principles
- **Atomicity**: Every credit modification is an all-or-nothing database transaction. The ledger can never be in an inconsistent state.
- **Sovereignty**: The OS, not a third-party, defines the rules of its economy. No platform risk, no arbitrary account freezes.
- **Precision**: The system is designed for high-frequency, low-cost micro-transactions, which are essential for billing granular agentic actions.
- **Auditability**: Every transaction creates an immutable record, providing a complete, exportable audit trail.

---

## 4. Architecture & Components

### 4.1. The Ledger Service (`ledger-service.ts`)
This is the **single source of truth** for all financial operations. It is not a tool to be called directly by agents but a privileged service invoked by other authorized systems.

- **`createTransaction` (Internal)**: The core internal function that atomically debits or credits a workspace balance and creates the corresponding `Transaction` record. This function is **not** exposed as an agent tool.
- **`createManualTransaction` (Tool)**: An agent-callable wrapper around `createTransaction` for user-initiated debits/credits.
- **`logTributeEvent` (Service-to-Service)**: A specialized function called by the `klepsydra-service` to atomically process the financial outcome of a tribute to a Folly Instrument. It validates sufficient credits before executing the transaction.
- **`getWorkspaceTransactions`**: Retrieves a paginated history of transactions for a workspace.

### 4.2. Prisma Schema (`Transaction` Model)
The `Transaction` table is the immutable heart of the ledger. See the full [Database Schema Documentation](./DATABASE.md) for details.

### 4.3. Top-Up & On-Ramps
- **Manual Reconciliation**: The MVP relies on an administrator confirming out-of-band payments (e.g., Interac e-Transfer). The `confirmPendingTransaction` action updates a `PENDING` transaction to `COMPLETED` and applies the credits.
- **Agentic Request**: BEEP can use the `requestCreditTopUp` tool to create a `PENDING` credit transaction, which awaits manual confirmation.

---

## 5. Integration with Core Systems

### 5.1. BEEP & Agentic Billing
- Agents **do not** interact with the ledger directly. They call the `authorizeAndDebitAgentActions` function from the `billing-service`.
- This service handles the logic of checking plan limits, determining overage, and then calling the `ledger-service` to execute the `DEBIT`. This abstracts the complexity of billing away from individual agents.

### 5.2. Klepsydra Engine (`klepsydra-service`)
- Obelisk Pay is the **transactional backbone** for the entire Klepsydra Engine.
- When a user makes a tribute, the `klepsydra-service` calculates the outcome and boon amount. It then calls the `logTributeEvent` function in `ledger-service` to atomically record the transaction. This atomic operation guarantees that the ledger remains consistent and funds cannot be spent if they are not available.

---

## 6. Summary: Why Obelisk Pay is Architecturally Sovereign

-   **Zero Third-Party Fees:** No 2.9% + $0.30 cut for Stripe. 100% of revenue stays in the ΛΞVON economy.
-   **Total Financial Sovereignty:** No frozen accounts, no platform risk. You control the rules.
-   **Pricing Precision:** Enables high-frequency, low-cost micro-transactions perfect for agentic services.
-   **Superior UX:** Conversational payments and one-click credit usage are faster and more intuitive than any web-based checkout.

Obelisk Pay is not a feature. It is a statement of architectural and economic independence.
