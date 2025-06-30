# Patrickt™: The Martyr of Mayhem - Technical Specification

> “Selling drugs, fucking friends, breaking hearts — and still somehow surviving your shit.”

---

## 1. System Overview

The Patrickt™ app is a **specialized emotional self-defense utility** implemented as a Micro-App within ΛΞVON OS. It is designed to help a user manage a specific, chaotic, and emotionally taxing relationship by transforming anecdotal drama into structured data.

It serves as a private, humorous, and functional tool for logging events, tracking emotional capital (`Forgiveness Bank`), and generating cathartic roasts, thereby preventing user burnout from a toxic dynamic.

---

## 2. Core Components & Implementation

### 2.1. The `patrickt-agent` (`agents/patrickt-agent.ts`)
The app's logic is powered by a dedicated Genkit agent with three primary actions:
- **`LOG_EVENT`**: Takes a description and category and returns a structured `LoggedEvent` object, including calculated `MartyrPoints`. This is a mock DB interaction within the agent for the prototype.
- **`ANALYZE_DRAMA`**: A placeholder for a future text analysis function. In the current implementation, it returns mock data.
- **`GENERATE_ROAST`**: Invokes an LLM with a specific prompt to generate a savage, Patrickt-style quote.

Each action is a billable agent operation.

### 2.2. The `PatricktApp` Micro-App (`micro-apps/patrickt.tsx`)
The UI is a single, self-contained React component that provides the core user experience.
- **Legend Tracker**: The main view, which includes a form for logging new "Legendary Moments." Submitted events are added to a client-side state for immediate UI feedback.
- **Event Timeline**: A scrollable list of logged events, each with an icon and color corresponding to its category, displaying the description and Martyr Points earned.
- **HUD (Heads-Up Display)**:
  - **Martyr Points™**: A running total of points earned from logged events.
  - **Forgiveness Bank**: A progress bar representing the user's emotional capital, which depletes with negative events and replenishes with "Redemption Attempts."

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Patrickt™ app can be launched from the Canvas or via a BEEP command.
- **Agentic Control**: BEEP can directly use the `managePatricktSaga` tool to interact with the `patrickt-agent`. For example, a user can command: `log a new Patrickt moment in the Friend Betrayals category: he ate my fucking leftovers`.
- **The Armory**: As a high-affinity utility, the Patrickt™ app is listed in The Armory as a featured, one-time purchase, driving engagement with the ΞCredit economy.

The Patrickt™ Micro-App is a testament to the ΛΞVON OS philosophy of building hyper-specific, deeply personal problems, even if those problems are, in fact, just one person.
