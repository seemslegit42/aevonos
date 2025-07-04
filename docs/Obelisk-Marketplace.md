# Obelisk Marketplace: The Sovereign's Arsenal - Technical Specification

> "Where will is transmuted into reality."

---

## 1. System Overview

The Obelisk Marketplace is a **privileged, end-game utility Micro-App** that serves as the ultimate expression of economic power within ΛΞVON OS. It allows high-tier users (Sovereigns) to transmute vast sums of ΞCredits into exclusive, high-value, real-world assets and services.

This is not a simple store. It is a sanctum of power, accessible only to those who have demonstrated supreme mastery and devotion to the OS.

---

## 2. Core Components & Implementation

### 2.1. The `obelisk-marketplace.tsx` Component
- **Gated Access**: The component first checks the user's `planTier`. If the user is not on the `Priesthood` plan, it renders a "Forbidden" view, denying them access.
- **Curated Offerings**: For authorized users, it displays a curated list of high-value offerings, such as:
  - A lifetime license for a premium developer tool.
  - A physical, obsidian-cased private server for running secure daemons.
  - A one-on-one strategic consultation with the ΛΞVON OS founders.
  - A "Seat in the Pantheon" (a token fraction of company equity).
- **Tribute Proposal Flow**: Each offering has a "Propose Tribute" button. Clicking this initiates a review process, notifying the user that their request has been sent to the `Proxy.Agent` for manual review and fulfillment.

### 2.2. Backend Integration
- **`Proxy.Agent`**: The Marketplace is the primary interface for initiating requests that will be fulfilled by the `Proxy.Agent` and the `transmuteCredits` tool.
- **`ledger-service`**: While the initial proposal is a soft action, the final fulfillment by an administrator would trigger the `transmuteCredits` function in the `ledger-service` to atomically debit the user's account and log the massive transaction.

---

## 3. Integration with ΛΞVON OS

- **Economic End-Game**: The Marketplace provides a crucial end-game for the ΞCredit economy, giving true, tangible value to the in-system currency and rewarding the most dedicated users.
- **Sovereignty Class**: Access is strictly tied to the user's plan and status, reinforcing the hierarchical and aspirational nature of the OS's society.
- **Architectural Role**: It serves as the bridge between the digital and physical worlds, proving the core doctrine that ΞCredits can command real-world value