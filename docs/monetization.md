# ΛΞVON OS: Monetization - Agent Actions Billing

## 1. Introduction: The Value-Based Hybrid Model

ΛΞVON OS is priced by **Agent Actions per month**, a strategic departure from traditional user-seat models. This monetization strategy is a weapon against SaaS bloat and unpredictable costs, directly tying the platform's revenue to the tangible value delivered by its AI-driven work. Every agent-triggered action, Micro-App operation, or user instruction executed by ΛΞVON OS is a billable, traceable interaction.

## 2. The Core Metric: Agent Actions (CogniOps)

-   **Definition**: An "Agent Action" (internally referred to as a CogniOp - Cognitive Operation) is a standardized unit of work performed by the system's agents. It represents the cost of an AI model interaction (e.g., an LLM call), an external API call via a tool, or the execution of a complex workflow step.
-   **Abstraction**: This metric abstracts away raw technical metrics like CPU-seconds or API tokens, providing users with a single, understandable, and predictable value metric, similar to how Zapier uses "Tasks."
-   **Billing**: The `authorizeAndDebitAgentActions` function in `src/services/billing-service.ts` is called by agentic tools and flows to atomically debit a workspace's balance for each action performed.

## 3. Pricing Structure: Tiered Subscriptions & Usage-Based Billing

Our monetization model is a hybrid that balances predictable recurring revenue with scalable, usage-based components.

### 3.1. Tiered Subscriptions (Gated by Agentic Capacity)

Subscription tiers are uniquely structured by gating access to a monthly quota of Agent Actions (CogniOps), which is the core value customers pay for.

-   **Apprentice (Free)**:
    -   **Target User**: Individuals, Explorers, Developers. Primary acquisition funnel for Product-Led Growth.
    -   **CogniOps Quota**: Strictly limited monthly quota (e.g., 100 CogniOps) to demonstrate BEEP's power for simple tasks.
    -   **Limitations**: Restricted access to premium Micro-Apps.

-   **Artisan (Pro)**:
    -   **Price**: ~$20 / user / month (positioning as a premium tool).
    -   **Target User**: Solo Operators, Small Teams, Power Users. Primary self-service revenue engine.
    -   **CogniOps Quota**: Generous monthly quota (e.g., 2,000 CogniOps).
    -   **Features**: Unlocks full ecosystem power, including full Armory marketplace access and unlimited custom agentic workflow creation in Loom Studio. Overage is handled via prepaid credits.

-   **Priesthood (Enterprise)**:
    -   **Price**: Custom Quote.
    -   **Target User**: Larger Organizations, Autonomous Corporate Departments, Businesses with stringent security/compliance needs.
    -   **Features**: Includes everything in the Artisan tier plus advanced security/governance (Aegis with SSO, audit logs), very high/unlimited CogniOps quotas, advanced admin tools, and dedicated/premium support.

### 3.2. Usage-Based Billing for Overage (Prepaid Credits)

To manage overages and provide budget predictability, a prepaid credit system is used.

-   **Mechanism**: Users purchase a bank of "**ΞCredits**" upfront via the `TopUpDialog`. These credits are drawn down as they consume Agent Actions beyond their subscription tier's monthly allowance.
-   **Benefits**: Offers firm budget control for users, prevents surprise bills, and improves cash flow for ΛΞVON OS by collecting revenue upfront.
-   **Risk Management**: This component is a fundamental risk management requirement, ensuring scalable profitability by aligning revenue with the variable COGS of AI computation.

### 3.3. The Engine: Obelisk Pay

All ΞCredit transactions, from Agent Action debits to Armory purchases, are powered by **Obelisk Pay**—the sovereign, closed-loop payment engine of ΛΞVON OS. This system provides unparalleled speed and precision, ensuring every unit of value is tracked without reliance on external processors. For more details on its architecture, see the [Obelisk Pay documentation](./OBELISK-PAY.md).

## 4. The Ecosystem Engine: ΛΞVON Armory Marketplace Monetization

The "ΛΞVON Armory" is the engine of the ecosystem, positioned as the central, sanctified repository of tools.

-   **Curation as a Differentiator**: A rigorously curated marketplace enforces high standards of quality, security, and aesthetic cohesion, building a premium, trustworthy user experience.
-   **Monetization Mechanics**: Supports one-time purchases for unlocking premium Micro-Apps and Chaos Cards, paid for with ΞCredits.

## 5. High-Value Enterprise Offerings

For larger organizations with complex needs:

-   **ΛΞVON Professional Services**: A high-margin division to design and build bespoke Micro-Apps and complex agentic workflows for enterprise clients.
-   **Dedicated & Managed Services**: Single-tenant, dedicated deployments (private cloud/on-premises) of the entire platform for highly regulated industries.
-   **Premium Support Contracts**: Tiered support (e.g., Gold, Platinum) with guaranteed Service Level Agreements (SLAs).
