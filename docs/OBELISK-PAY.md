# Obelisk Pay: The Sovereign Payment Engine

> “A monument to sovereignty. A burial site for third-party fees.”

---

## 1. System Overview

Obelisk Pay is a closed-loop, modular payment and transaction engine designed to run entirely within ΛΞVON OS. It uses internal credits (**ΞCredits**) as the currency of record, facilitating payments without reliance on Stripe, PayPal, or any external processor. This architecture provides unparalleled sovereignty, speed, and precision in monetization.

It's not just a feature; it's a foundational component of the OS, designed for a future where value exchange is as seamless as a command.

> Think Steam Wallet meets mobile top-up meets on-premise fintech kernel.

---

## 2. Core Components

### 2.1. ΞCredit Ledger Engine
A self-balancing, double-entry ledger that tracks all transactional activity within a workspace.
- **Atomic Transactions:** Ensures that credit balances are only ever modified through auditable, all-or-nothing database transactions.
- **Balance Tracking:** User and workspace balances are maintained with `Decimal` precision.
- **Agent Action Consumption:** Every action taken by an AI agent can be logged as a debit against a workspace's balance.
- **Tamper-Resistance:** Future-proofed for Merkle hash snapshots to ensure ledger integrity.

### 2.2. Top-Up Mechanism
A fiat-optional on-ramp for injecting credits into the ecosystem.
- **Manual Admin Injection (MVP):** Allows administrators to credit accounts directly.
- **Interac e-Transfer (Canada-Specific):** Provides a clear, low-friction top-up method for Canadian users via a manual reconciliation workflow. A webhook-based automation is the next logical step.
- **Agentic Integration:** BEEP can detect user intent (e.g., "add $100 in credits") and initiate the top-up process.
- **Future-Ready:** Architected for future integration with crypto on-ramps (USDC, ETH) or traditional banking APIs (Plaid).

### 2.3. ΞCredit Tokenization
Credits are treated as a first-class utility token within the OS.
- **Closed-Loop:** Credits are non-transferable between different organizations by default, simplifying compliance.
- **Scoped Usage:** Credits can be tied to specific actions: Micro-App unlocks, Agent Action quotas, or premium feature access.
- **Flexible Tokenomics:** The architecture supports future models like time-expiring credits, earned vs. purchased tiers, and referral bonuses.

### 2.4. BEEP-Powered Payments
All payment logic can be routed through the central BEEP command interface.
- **Natural Language Transactions:** Users can execute financial commands like `"Charge 15 credits for this document"` or `"Refund 5 credits to client"`.
- **Workflow Integration:** Agents can pause workflows if a balance is low and use BEEP to request a user top-up before proceeding.

### 2.5. Transactional Graph & Audit Trail
Every transaction is a piece of evidence.
- **Detailed Logging:** Every credit or debit logs who initiated it, what it cost, and what it did, with agent and user IDs.
- **Export-Ready:** The ledger is designed for easy export to CSV for accounting software like QuickBooks, Wave, or Xero.
- **Visual Auditing:** The `UsageMonitor` micro-app provides a clear, real-time feed of all transactions.

### 2.6. Klepsydra Integration: The Engine of Folly
Obelisk Pay is not merely for straightforward debits and credits; it is the transactional backbone for the entire **Klepsydra Engine** (the "Profit Pulse" system). Every "tribute" made to a Folly Instrument, and every "boon" granted in return, is an atomic transaction meticulously recorded on the Obelisk ledger.

- **Atomic Tributes:** When a user engages an Instrument of Folly, `klepsydra-service` calculates the outcome, but it is `ledger-service`'s `logTributeEvent` function that executes the financial consequence. The tribute amount is debited, and any boon amount is credited, in a single, inseparable database transaction. This ensures the economy remains perfectly balanced.
- **Rich Metadata:** Each `TRIBUTE` transaction is enriched with Klepsydra-specific metadata, including the `instrumentId`, the user's `luckWeight` at the moment of the tribute, the `outcome`, and the `boonAmount`. This provides an unparalleled level of data for the Economic Observatory to analyze user behavior and tune the system's pulse.
- **Seamless Integration:** The user experiences a magical, seamless interaction with a Folly Instrument. Behind the scenes, Obelisk Pay provides the cold, hard, auditable truth of every micro-gamble, making the abstract concept of "luck" a measurable, billable event.

---

## 3. Security & Compliance Protocols

### 3.1. Security-by-Design
- **Zero-Trust Auth:** All transactional endpoints are protected and scoped by JWT-based session tokens.
- **Data Encryption:** All sensitive financial data is encrypted at rest and in transit.
- **Agent Verification:** No unauthorized charges. Transactions initiated by agents are logged against that agent's ID.
- **Aegis Integration:** The architecture is designed for future integration with Aegis to auto-freeze suspicious balances or throttle unusual transaction velocities.

### 3.2. Compliance Strategy (Canada-Focused)
Obelisk Pay is architected to operate initially as a **closed-loop prepaid system**, which mitigates the need for immediate MSB (Money Service Business) registration with FINTRAC.
- **No Cash-Out (MVP):** By disallowing direct fiat withdrawals, the system avoids being classified as a money transmitter.
- **Utility, Not Currency:** ΞCredits are aggressively labeled and treated as a utility for accessing OS services, not as a stored value equivalent to fiat currency.
- **Future Off-Ramps:** A crypto-based withdrawal option (e.g., to a USDC wallet) or a fully compliant MSB registration can be offered as a premium, future extension.

---

## 4. UX Principles: The "Invisible Bank"

All transactions must feel like magic, not accounting.
- **Instant:** One-click payments and conversational commands eliminate the friction of traditional checkout flows.
- **Silent:** The system works in the background. Users don't need to think about payments; they just use the OS.
- **Auditable:** When needed, the entire history of value exchange is available in a clear, human-readable format.
- **Sovereign:** Users feel in control because they are. There are no opaque third-party rules or fees.

---

## 5. Summary: Why Obelisk Pay is a Power Move

-   **Zero Third-Party Fees:** No 2.9% + $0.30 cut for Stripe. 100% of revenue stays in the ΛΞVON economy.
-   **Total Financial Sovereignty:** No frozen accounts, no platform risk. You control the rules.
-   **Pricing Precision:** Enables high-frequency, low-cost micro-transactions perfect for agentic services.
-   **Superior UX:** Conversational payments and one-click credit usage are faster and more intuitive than any web-based checkout.
-   **Canadian Advantage:** Built from the ground up to leverage Interac e-Transfer, a trusted and low-cost on-ramp for the Canadian market.

Obelisk Pay is not a feature. It is a statement of architectural and economic independence.
