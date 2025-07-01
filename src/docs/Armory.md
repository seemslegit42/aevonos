
# The Armory: Micro-App & Artifact Marketplace - Technical Specification

> "A tool is an extension of the will. Here is your arsenal."

---

## 1. System Overview

The Armory is a **core ecosystem Micro-App** that serves as the central, sanctified repository for all acquirable tools, agents, and artifacts within ΛΞVON OS. It is the primary interface for users to browse, discover, and spend ΞCredits to unlock new capabilities.

It is not merely a store; it is a curated gallery of power, designed to feel like an ancient vault or a high-tech arsenal rather than a typical app marketplace.

---

## 2. Core Components & Implementation

### 2.1. The `Armory` Micro-App (`micro-apps/armory.tsx`)
The UI is designed to showcase available artifacts with reverence and clarity.
- **Catalog View**: Displays listings for `MicroAppManifests` and `ChaosCardManifests` in a rich, card-based layout.
- **Filtering & Search**: Provides an input for text-based search and a tag-based filtering system to allow users to quickly find relevant tools.
- **Tabbed Interface**: Separates Micro-Apps from Chaos Cards for clear navigation.
- **Acquisition Flow**: Integrates directly with the `purchaseMicroApp` and `makeFollyTribute` (for Chaos Cards) server actions, which in turn use the Obelisk Pay and Klepsydra Engine subsystems.
- **State Awareness**: The UI dynamically reflects the user's ownership status, disabling purchase buttons for already-acquired items.

### 2.2. Configuration-as-Code (`config/artifacts.ts`)
- **Manifests**: The Armory's catalog is driven by a single, unified static manifest file. This approach ensures that all available tools are version-controlled and tightly integrated with the codebase, allowing for rapid development and deployment of new offerings. Each manifest defines an item's name, description, cost, and other essential metadata.

### 2.3. Backend & Service Integration
- **`purchaseMicroApp` / `makeFollyTribute` Actions**: These server actions handle the business logic of an acquisition. They verify the user's credit balance, call the appropriate services (`ledger-service`, `klepsydra-service`), update the user's or workspace's ownership records in the database, and log the transaction.
- **`logInstrumentDiscovery` Action**: The Armory UI uses this "fire-and-forget" action to log when a user first views an item. This data feeds the Nudge Engine, enabling proactive, context-aware suggestions from BEEP.

---

## 3. Integration with ΛΞVON OS

- **Economic Engine**: The Armory is the primary driver of the ΞCredit economy, transforming the expansion of a user's toolkit from a simple purchase into a deliberate act of investment and belief in the OS.
- **Invocation**: The Armory can be launched from the Canvas or via a BEEP command like "Show me what's in the Armory" or "I need a new tool."
- **Architectural Role**: It serves as the gateway to the entire ecosystem of specialized tools, reinforcing the OS's philosophy of providing hyper-specific, high-affinity solutions rather than bloated, one-size-fits-all applications.
