
# Patrickt™: The Martyr of Mayhem - Technical Specification

> "A legend in his own mind, a menace to your sanity."

---

## 1. System Overview

Patrickt™ is a **lifestyle and entertainment Micro-App** that allows users to satirically log and analyze the chaotic events surrounding a person named "Patrickt." It gamifies drama by awarding "Martyr Points™" and tracking a "Forgiveness Bank."

This is a tool for comedic storytelling and tracking interpersonal chaos.

---

## 2. Core Components & Implementation

### 2.1. The `patrickt-agent` (`agents/patrickt-agent.ts`)
The agent's logic is a multi-action flow that can perform one of three tasks based on user input.
- **`LOG_EVENT`**: Takes an `eventDescription` and `eventCategory` and returns a mock `LoggedEvent` object with calculated `martyrPoints`.
- **`ANALYZE_DRAMA`**: Takes a `chatInput` string, analyzes it for volatility, and returns a `dramaLevel` score and a `prediction`.
- **`GENERATE_ROAST`**: Generates a single, savage, Patrickt-style roast quote.
- **Billing**: The agent demonstrates conditional billing, charging for a `COMPLEX_LLM` action for `ANALYZE_DRAMA` and a `SIMPLE_LLM` action for the others.

### 2.2. The `PatricktApp` Micro-App (`micro-apps/patrickt.tsx`)
The UI is a thematic "Saga" dashboard for logging and viewing the chaos.
- **Event Logging**: A `Textarea` and `Select` dropdown allow users to log new chaotic events.
- **Metrics Display**: Cards display the running total of "Martyr Points" and the current "Forgiveness Bank" as a progress bar.
- **Timeline**: A scrollable area shows a reverse-chronological list of all logged events, styled by category.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command, e.g., "log this Patrickt moment..."
- **Multi-Action Agent**: Demonstrates a more complex agent capable of performing different functions based on the user's intent within the same tool.
- **The Armory**: As a uniquely niche entertainment utility, Patrickt™ is available in The Armory for a one-time purchase.
