# Proxy.Agent: The Hand of the Architect - Technical Specification

> "A tribute is proposed. The transmutation is prepared. Authorize the ritual."

---

## 1. System Overview

The Proxy.Agent is a **specialized utility Micro-App** that serves as the secure authorization interface for transmuting ΞCredits into real-world payments. It is the final, critical step in the `Obelisk Pay` workflow for high-value external tributes.

It is summoned, not launched, typically in response to a BEEP command like "Pay this bill for $175" or a tribute proposal from the `Obelisk-Marketplace`.

---

## 2. Core Components & Implementation

### 2.1. The `proxy-agent.tsx` Component
- **Dynamic Content**: The component is rendered with props (`vendor`, `amount`, `currency`) passed from the BEEP command that summoned it.
- **Quote & Authorization Flow**:
  1.  **Initiate Transmutation**: On mount, it calls the `/api/proxy/initiate_transmutation` endpoint to get a secure, time-sensitive quote for the transaction. This quote includes the cost in Ξ, the transmutation tithe, and the total debit amount.
  2.  **Display Quote**: It displays this information clearly to the user for final review.
  3.  **Authorize**: A single "AUTHORIZE" button, often styled with a fingerprint icon, allows the user to confirm the tribute.
  4.  **Execute Transmutation**: Clicking "AUTHORIZE" calls the `/api/proxy/execute_transmutation` endpoint, passing the quote data. The backend `ledger-service` then performs the atomic debit and (in a real system) executes the real-world payment.
- **Visual Feedback**: The UI provides clear states for `quoting`, `ready`, `authorizing`, and `complete`, including a "Physical Payout Sigil" animation on success.

### 2.2. Backend Services
- **`ledger-service.ts`**: The `transmuteCredits` function within this service contains all the core business logic for quoting, validating, and executing the transaction. It is the single source of truth for the transmutation process.
- **Secure Endpoints**: The `/api/proxy/*` routes provide a secure, session-authenticated bridge between the frontend component and the backend service logic.

---

## 3. Integration with ΛΞVON OS

- **Obelisk Pay**: The Proxy.Agent is the user-facing confirmation step for the most powerful feature of the `Obelisk Pay` subsystem.
- **BEEP Orchestration**: It is a prime example of a UI component that is orchestrated and populated by data from a BEEP command, demonstrating the seamless flow from conversation to action.
- **Architectural Role**: