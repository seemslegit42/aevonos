# Obelisk Pay: Sovereign Ledger & Transaction Engine - Technical Specification

> “A monument to sovereignty. A burial site for third-party fees.”

---

## 1. System Overview

Obelisk Pay is the **sovereign, closed-loop payment and transaction engine** for ΛΞVON OS. It provides the foundational infrastructure for all value exchange within a workspace, using internal credits (**ΞCredits**) as the sole currency of record.

This system is architected for **absolute financial sovereignty**, eliminating reliance on external processors like Stripe or PayPal for core operations. All logic is handled by the `ledger-service`, which ensures atomic, auditable, and precise management of ΞCredits.

### 1.1. Core Principles
- **Atomicity**: Every credit modification is an all-or-nothing database transaction. The ledger can never be in an inconsistent state.
- **Sovereignty**: The OS, not a third-party, defines the rules of its economy. No platform risk, no arbitrary account freezes.
- **Precision**: The system is designed for high-frequency, low-cost micro-transactions, which are essential for billing granular agentic actions.
- **Auditability**: Every transaction creates an immutable record, providing a complete, exportable audit trail.

---

## 2. Architecture & Components

### 2.1. The Ledger Service (`ledger-service.ts`)
This is the **single source of truth** for all financial operations. It is not a tool to be called directly by agents but a privileged service invoked by other authorized systems.

- **`createTransaction` (Internal)**: The core internal function that atomically debits or credits a workspace balance and creates the corresponding `Transaction` record. This function is **not** exposed as an agent tool.
- **`createManualTransaction` (Tool)**: An agent-callable wrapper around `createTransaction` for user-initiated debits/credits.
- **`logTributeEvent` (Service-to-Service)**: A specialized function called by the `klepsydra-service` to atomically process the financial outcome of a tribute to a Folly Instrument. This ensures that the risk/reward calculation and the financial transaction are inseparable.
- **`getWorkspaceTransactions`**: Retrieves a paginated history of transactions for a workspace.

### 2.2. Prisma Schema (`Transaction` Model)
The `Transaction` table is the immutable heart of the ledger.

```prisma
model Transaction {
  id          String   @id @default(cuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  type        TransactionType // CREDIT, DEBIT, TRIBUTE
  amount      Decimal  // The net change to the balance
  description String
  status      TransactionStatus // PENDING, COMPLETED, FAILED
  createdAt   DateTime @default(now())
  
  // For Klepsydra Engine tributes
  instrumentId String?
  luckWeight   Float?
  outcome      String?
  boonAmount   Decimal? // Gross win amount before tribute is subtracted
  userPsyche   UserPsyche?
}
```

- **`type`**: Enum defining the transaction's nature.
  - `CREDIT`: Adds to the balance (e.g., top-up, boon).
  - `DEBIT`: Subtracts from the balance (e.g., agent action, app purchase).
  - `TRIBUTE`: A special type for Folly Instruments, where `amount` represents the *net* change (`boonAmount` - `tributeAmount`).
- **`amount`**: The `Decimal` value representing the net change. For a TRIBUTE, this will be `boonAmount - tributeAmount`.
- **`boonAmount`**: Stores the gross amount won in a TRIBUTE, providing clear data for economic analysis.

### 2.3. Top-Up & On-Ramps
- **Manual Reconciliation**: The MVP relies on an administrator confirming out-of-band payments (e.g., Interac e-Transfer). The `confirmPendingTransaction` action updates a `PENDING` transaction to `COMPLETED` and applies the credits.
- **Agentic Request**: BEEP can use the `requestCreditTopUp` tool to create a `PENDING` credit transaction, which awaits manual confirmation.

---

## 3. Integration with Core Systems

### 3.1. BEEP & Agentic Billing
- Agents **do not** interact with the ledger directly. They call the `authorizeAndDebitAgentActions` function from the `billing-service`.
- This service handles the logic of checking plan limits, determining overage, and then calling the `ledger-service` to execute the `DEBIT`. This abstracts the complexity of billing away from individual agents.

### 3.2. Klepsydra Engine (`klepsydra-service`)
- Obelisk Pay is the **transactional backbone** for the entire Klepsydra Engine.
- When a user makes a tribute, the `klepsydra-service` calculates the `outcome` and `boonAmount`.
- It then calls the `logTributeEvent` function in `ledger-service`. This function performs the atomic operation of debiting the `tributeAmount` and crediting the `boonAmount` in a single `TRIBUTE` transaction.
- This tight coupling ensures that the gamified risk layer and the hard financial ledger are always perfectly synchronized. The `Transaction` log for a `TRIBUTE` contains all the rich metadata (luck, outcome, etc.) needed to analyze the **Tribute Velocity Index (TVI)**.

---

## 4. Security & Compliance

### 4.1. Security Protocols
- **Atomic Operations**: `prisma.$transaction` is used for all balance-modifying operations to prevent partial updates and ensure data integrity.
- **Zero-Trust Authorization**: All API endpoints related to transactions are protected by `middleware.ts` and require a valid JWT. Role-based access control (RBAC) prevents unauthorized actions (e.g., only an `ADMIN` can confirm a pending top-up).
- **Aegis Integration**: The `requestCreditTopUp` flow invokes an `aegisAnomalyScan` to check for suspicious behavior (e.g., multiple large top-up requests in a short time), flagging potential fraud before funds are even received.

### 4.2. Compliance Strategy (Canada-Focused MVP)
Obelisk Pay is architected to operate initially as a **closed-loop prepaid system**, which mitigates the need for immediate MSB (Money Service Business) registration with FINTRAC.
- **No Fiat Off-Ramp**: Credits can be spent within the OS but cannot be withdrawn as fiat currency. This is the key distinction that keeps it outside the definition of a money transmitter.
- **Utility Token Model**: ΞCredits are legally and functionally defined as a utility token for accessing OS services, not as a stored value equivalent to fiat currency.

---

## 5. Summary: Why Obelisk Pay is Architecturally Sovereign

-   **Zero Third-Party Fees:** No 2.9% + $0.30 cut for Stripe. 100% of revenue stays in the ΛΞVON economy.
-   **Total Financial Sovereignty:** No frozen accounts, no platform risk. You control the rules.
-   **Pricing Precision:** Enables high-frequency, low-cost micro-transactions perfect for agentic services.
-   **Superior UX:** Conversational payments and one-click credit usage are faster and more intuitive than any web-based checkout.
-   **Canadian Advantage:** Built from the ground up to leverage Interac e-Transfer, a trusted and low-cost on-ramp for the Canadian market.

Obelisk Pay is not a feature. It is a statement of architectural and economic independence.
