# ΛΞVON OS: Database Schema Specification

> "The architecture of truth is built on well-defined tables."

---

## 1. Overview

This document outlines the Prisma schema for ΛΞVON OS, which serves as the foundational data layer for the entire application. The schema is designed with multi-tenancy, security, and scalability in mind, using a PostgreSQL database. It provides the structure for all core entities, from users and workspaces to agentic workflows and the internal economy.

## 2. Core Tenancy Models

These models form the basis of the system's multi-tenant architecture.

### `User`
-   **Purpose**: Represents an individual user account.
-   **Key Fields**:
    -   `id`: Unique identifier for the user.
    -   `email`, `password`: Standard authentication credentials.
    -   `role`: (`ADMIN`, `MANAGER`, `OPERATOR`, `AUDITOR`) - Governs user permissions within a workspace.
    -   `psyche`: (`ZEN_ARCHITECT`, `SYNDICATE_ENFORCER`, `RISK_AVERSE_ARTISAN`) - The user's chosen psychological archetype from the Rite of Invocation, used for personalization.
    -   `agentAlias`: The user's personalized name for BEEP.
    -   `unlockedChaosCardKeys`: An array of strings containing the keys of purchased Chaos Cards.
-   **Relations**: A user can be a member of multiple `Workspace`s.

### `Workspace`
-   **Purpose**: The primary data container for a single tenant (an organization or an individual's "Canvas"). All other data is scoped to a workspace.
-   **Key Fields**:
    -   `id`: Unique identifier for the workspace.
    -   `name`: The user-defined name of the workspace.
    -   `ownerId`: A foreign key to the `User` who owns the workspace.
    -   `planTier`: (`Apprentice`, `Artisan`, `Priesthood`) - The current subscription plan.
    -   `credits`: The current balance of ΞCredits.
    -   `agentActionsUsed`: A counter for the number of agent actions consumed in the current billing cycle.
    -   `unlockedAppIds`: An array of strings containing the IDs of purchased Micro-Apps from The Armory.
-   **Relations**: A workspace has one owner (`User`), multiple members (`User`), and contains all other data models like `Agent`, `Contact`, `SecurityAlert`, etc.

## 3. Agentic & Workflow Models

These models support the Loom Studio and the agentic capabilities of the OS.

### `Agent`
-   **Purpose**: Represents a deployed instance of a specialized AI agent (e.g., "Winston Wolfe", "Dr. Syntax").
-   **Key Fields**:
    -   `type`: A string identifier for the agent's type, mapping to its code implementation.
    -   `status`: The current operational status (`active`, `idle`, `error`).

### `Workflow` & `WorkflowRun`
-   **Purpose**: `Workflow` stores the JSON definition of an automation created in Loom Studio. `WorkflowRun` stores the history, logs, and results of each execution of a workflow.
-   **Key Fields**:
    -   `definition`: A JSONB field in `Workflow` containing the nodes and edges of the visual graph.
    -   `log`: A JSONB field in `WorkflowRun` containing a step-by-step log of the execution for debugging.
    -   `output`: The final JSON payload returned by a completed workflow run.

## 4. Economic Engine Models (Obelisk Pay & Klepsydra)

These models power the internal economy of ΛΞVON OS.

### `Transaction`
-   **Purpose**: The immutable heart of the Obelisk Pay ledger. Records every single credit or debit to a workspace's balance.
-   **Key Fields**:
    -   `type`: (`CREDIT`, `DEBIT`, `TRIBUTE`) - Defines the nature of the transaction.
    -   `amount`: The net change to the balance.
    -   `description`: A human-readable description of the transaction.
    -   `instrumentId`, `luckWeight`, `outcome`, `boonAmount`: Special fields to store rich metadata for `TRIBUTE` transactions from Folly Instruments.
    -   `judasFactor`: A decimal representing the reduction factor in a 'hollow win' scenario from the Judas Algorithm.

### `PulseProfile`
-   **Purpose**: The core of the Klepsydra Engine. Stores each user's unique "luck" parameters and dynamic psychological state.
-   **Key Fields**:
    -   `consecutiveLosses`: A counter used to trigger the Pity Boon protocol.
    -   `lastEventTimestamp`: Used to calculate time decay in the pulse wave.
    -   `frustration`, `flowState`, `riskAversion`: Floating-point values (0-1) representing the user's current psychological state, which dynamically modulate economic outcomes.

### `ChaosCard` & `ActiveSystemEffect`
-   **Purpose**: `ChaosCard` is the manifest for acquirable Chaos Cards. It is not tied to a specific user. The `User.unlockedChaosCardKeys` field tracks ownership. `ActiveSystemEffect` tracks which temporary, system-wide effects (like theme changes from a card) are currently active for a workspace.

## 5. Utility & Application Models

These models support various Micro-Apps and core utilities.

### `Contact`
-   **Purpose**: Stores contact information for the CRM suite. Scoped to a `Workspace`.

### `SecurityAlert` & `ThreatFeed`
-   **Purpose**: `SecurityAlert` stores alerts generated by the Aegis subsystem. `ThreatFeed` stores the list of external threat intelligence URLs configured in the `Aegis-Command` app.

### `Conversation`
-   **Purpose**: Stores the history of a user's interactions with the BEEP agent, providing context for future commands.

### `InstrumentDiscovery`
-   **Purpose**: A crucial table for the Nudge Engine. It logs when a user first views an acquirable item in The Armory and tracks whether they eventually purchase it, allowing for the calculation of `Discovery-to-Tribute Time` (DTT).
