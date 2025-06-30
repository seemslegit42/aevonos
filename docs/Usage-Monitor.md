# Usage Monitor: The Credit Ledger - Technical Specification

> "The account is the anchor of sovereignty."

---

## 1. System Overview

The Usage Monitor is a **core utility Micro-App** that provides a transparent view into a workspace's economic status within ΛΞVON OS. It serves as the primary interface for users to track their Agent Action consumption, view their transaction history, and manage their ΞCredit balance.

It is the front-end to the Obelisk Pay ledger system, designed for clarity and administrative control.

---

## 2. Core Components & Implementation

### 2.1. The `Usage-Monitor` Micro-App (`micro-apps/usage-monitor.tsx`)
The UI is a clean, data-rich dashboard for all things billing-related.
- **Data Fetching**: On mount, the component makes parallel calls to `/api/billing/transactions`, `/api/workspaces/me`, and `/api/users/me` to fetch all necessary data.
- **Usage Meter**: Displays the workspace's current `agentActionsUsed` against their `planLimit` using a `Progress` bar, color-coded to indicate consumption level.
- **Transaction History**: A scrollable list of all recent `Transaction` records for the workspace. It includes special rendering for standard `DEBIT`/`CREDIT` transactions and more detailed cards for `TRIBUTE` events from Folly Instruments.
- **Admin Actions**: If the current user has `ADMIN` privileges, the UI will display a "Confirm" button next to any `PENDING` credit transactions, allowing them to approve out-of-band payments.
- **Top-Up Integration**: Includes a "Top-Up Credits" button that launches the `Top-Up` Micro-App.

### 2.2. Backend APIs & Services
- **`billing-service`**: The `getUsageDetails` flow (exposed via `/api/billing/usage/agent-actions`) provides the core usage metrics.
- **`ledger-service`**:
    - The `getWorkspaceTransactions` function (exposed via `/api/billing/transactions`) provides the history.
    - The `confirmPendingTransaction` server action is called by the UI to finalize pending credits.

### 2.3. The `Top-Up` Micro-App (`micro-apps/top-up.tsx`)
- **Purpose**: A separate, dedicated app for initiating a credit top-up.
- **Logic**: It provides instructions for an out-of-band payment (e.g., e-Transfer) and contains a form that calls the `requestCreditTopUp` server action. This action creates the `PENDING` transaction record that the Usage Monitor's admin view can then confirm.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Usage Monitor is typically launched by clicking the credit balance in the `TopBar`, but can also be summoned by BEEP.
- **Architectural Role**: It serves as the user-facing ledger for Obelisk Pay, making the abstract concept of ΞCredits and Agent Actions tangible and transparent. It is a critical component for building user trust in the platform's value-based monetization model.
