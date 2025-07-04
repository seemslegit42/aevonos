# Usage Monitor: The Ledger of Tribute - Technical Specification

> "Every action has a cost. Every tribute has a record. Here is the reckoning."

---

## 1. System Overview

The Usage Monitor is a **core utility Micro-App** that provides a transparent and detailed view of a workspace's economic activity. It is the primary user-facing interface for the `Obelisk Pay` subsystem, allowing users to track their ΞCredit balance, monitor their Agent Action consumption, and review their complete transaction history.

This is the central bank's public-facing branch, designed for clarity, accountability, and financial management.

---

## 2. Core Components & Implementation

### 2.1. The `usage-monitor.tsx` Component
- **Usage Dashboard**: At the top, it displays the workspace's current ΞCredit balance and a progress bar showing Agent Actions used against their monthly plan limit.
- **Transaction Log**: The main view is a reverse-chronological, scrollable feed of all transactions (CREDIT, DEBIT, TRIBUTE) for the workspace. Each entry is styled according to its type and shows the amount, description, and timestamp.
- **Top-Up Functionality**: Includes a button to launch the `Top-Up` Micro-App, allowing users to request more credits.
- **Chaos Arsenal**: A secondary tab that shows the user which `Chaos Cards` they have acquired and are available to use.

### 2.2. Backend APIs & Services
The monitor is powered by several endpoints and services:
- **`billing-service`**: The `getUsageDetails` function provides the Agent Action consumption data.
- **`ledger-service`**: The `getWorkspaceTransactions` function provides the complete transaction history.
- **`GET /api/users/me`**: Fetches the user's `unlockedChaosCardKeys` to display in the arsenal.

---

## 3. Integration with ΛΞVON OS

- **Economic Transparency**: The Usage Monitor is the key to providing users with a clear and transparent understanding of the OS's value-based pricing model. It makes the abstract concept of "Agent Actions" tangible.
- **Invocation**: It can be launched from the Canvas, from the `TopBar`'s credit balance display, or automatically by BEEP in response to an `InsufficientCreditsError`.
- **Architectural Role**: It serves as the immutable and auditable financial record for the user, reinforcing trust in the `Obelisk Pay` economy and providing the tools for responsible tribute management.