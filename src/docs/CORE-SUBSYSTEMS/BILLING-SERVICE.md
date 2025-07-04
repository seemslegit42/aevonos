# ΛΞVON OS: Integration - Billing Service API
1. Introduction: The Gatekeeper of Tribute
The billing-service is a critical component of the ΛΞVON OS economic ecosystem. It serves as the gatekeeper of tribute, providing a simplified, secure, and abstract interface for agents and Micro-Apps to interact with the underlying Obelisk Pay ledger and KLEPSYDRA Engine's economic rules. Its primary role is to ensure that every Agent Action is correctly authorized, debited, and accounted for, aligning with the "Agent Actions per month" monetization model.

2. Mental Model: The Abstracted Accountant
The billing-service is the abstracted accountant for ΛΞVON OS. Agents and Micro-Apps do not directly interact with the complex rules of pricing tiers, overage calculations, or the raw ledger. Instead, they simply request to "authorize and debit Agent Actions." The billing-service handles all the intricate logic behind the scenes, ensuring compliance with the user's Pact (subscription tier) and the system's economic policies, before instructing Obelisk Pay to execute the final transaction.

3. Core Principles
Abstraction: Shield agents and Micro-Apps from the complexities of billing logic.
Centralization: All requests for debiting Agent Actions flow through this single service.
Compliance: Enforce user plan limits and overage rules defined by the monetization strategy.
Security: Ensure only authorized requests trigger debits, leveraging Aegis for integrity.
Transparency (Internal): Provide clear logging of billing decisions for internal auditing and Fate Loom visualization.

4. Architecture & Components
The billing-service is a dedicated microservice, likely implemented as a Node.js/TypeScript service due to its integration with the Next.js frontend and Prisma ORM.

4.1. Internal API (authorizeAndDebitAgentActions)
This is the primary function exposed by the billing-service for internal consumption by other ΛΞVON OS services, Micro-Apps, and agents (via BEEP).

authorizeAndDebitAgentActions (Internal Function/API Endpoint):

Purpose: To check if a user has sufficient ΞCredits or Agent Actions allowance for a requested operation and, if authorized, to debit their balance.

Input Parameters:
`userId` (string, optional): The unique identifier of the user initiating the action.
`workspaceId` (string): The unique identifier of the user's workspace.
`actionType` (string): A predefined type of agent action (e.g., 'SIMPLE_LLM', 'COMPLEX_LLM', 'TOOL_USE').
`costMultiplier` (number, optional): A multiplier for the base cost, derived from the KLEPSYDRA engine (e.g., Luck(t) modifier, Chaos Card influence).
`context` (JSONB, optional): Additional contextual data for logging (e.g., MicroApp ID, Workflow ID, Agent ID).

Output:
`success` (boolean): True if authorization and debit were successful.
`remainingBalance` (number): User's remaining ΞCredits or Agent Actions allowance.
`message` (string): Human-readable message (e.g., "Debit successful," "Insufficient balance," "Plan limit reached").
`debitAmount` (number): The exact amount of ΞCredits debited.

Behavior:
Authentication & Authorization: Verifies the calling service/agent is authorized to request debits.
Plan Limit Check: Retrieves the user's current Pact (subscription tier) and checks their remaining monthly Agent Actions quota.
Cost Calculation: Determines the base cost of the action_type from a central ActionCostRegistry and applies the cost_multiplier from KLEPSYDRA.
Overage Determination: If the action exceeds the plan's quota, calculates the overage cost, potentially drawing from a prepaid ΞCredit balance.
Obelisk Pay Invocation: Calls the createTransaction function in the ledger-service (Obelisk Pay) to atomically debit the user's account. This is the only point where the billing-service directly interacts with the core ledger.
Logging: Logs the billing decision and transaction details for internal auditing and Fate Loom visualization.

4.2. Action Cost Registry
Description: A central, configurable map that stores the base cost (in Agent Actions) for every defined action_type.
Management: Managed by administrators (via The Loom of Fates) to adjust pricing precision and align with economic policies.

5. Integration with Core Systems
5.1. Obelisk Pay (ledger-service)
Transactional Execution: The billing-service is a primary caller of Obelisk Pay's createTransaction function, ensuring all debits are atomic and recorded with Absolute Integrity.

5.2. Klepsydra Engine (klepsydra-service)
Cost Modulation: Receives cost_multiplier values from klepsydra-service (derived from Luck(t) and Chaos Card effects) to apply dynamic pricing to Agent Actions.
Psyche-Calibration Engine (PCE): The PCE's insights into user psychology (e.g., Risk Aversion Gradient, Frustration Tolerance) can influence the cost_multiplier or trigger specific action_type suggestions via BEEP, which then flow through the billing-service.

5.3. BEEP & Agent Interactions
Indirect Agent Billing: Agents do not directly call ledger-service. Instead, when an agent performs a billable action (e.g., an LLM inference on the Groq LPU, a data transformation), it requests authorization and debit from the billing-service.
User Feedback: BEEP can provide real-time feedback to the user about ΞCredit balance, Agent Action consumption, and potential overages, maintaining transparency.

5.4. Loom Studio & The Loom of Fates
Visibility: The billing-service provides data to Loom Studio for visualization in The Loom of Fates, allowing administrators to monitor Agent Action consumption patterns, identify billing anomalies, and track Tribute Velocity.
Configuration: Administrators can configure ActionCostRegistry values and Pact (tier) parameters via Loom Studio.

6. Summary: The Precision of Profit
The billing-service is not just a billing API; it is a precision instrument of profit, ensuring that every valuable action within ΛΞVON OS is correctly accounted for and monetized. It is the invisible hand that connects user activity to the economic engine, upholding the principles of Sovereignty, Precision, and Auditability in every Agent Action.
