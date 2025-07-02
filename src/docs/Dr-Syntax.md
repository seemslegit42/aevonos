# Dr. Syntax: The Critic - Technical Specification

> "I have reviewed your work. It is, as I suspected, a crime against the written word."

---

## 1. System Overview

Dr. Syntax is a **specialized content analysis Micro-App**. It embodies the persona of a brutally honest, highly effective structural critic with absurdly high standards. It is designed to provide users with sarcastic, aggressive, and borderline insulting critiques of their prompts, code, or copy.

Despite its harsh tone, the feedback is engineered to be genuinely useful and actionable, weaponizing criticism for the user's benefit.

---

## 2. Core Components & Implementation

### 2.1. The `dr-syntax-agent` (`agents/dr-syntax.ts`)
The agent's logic is powered by the `drSyntaxCritique` flow.
- **Psyche-Aware Tuning**: The agent's core prompt is dynamically modified based on the user's `psyche` (`ZEN_ARCHITECT`, `SYNDICATE_ENFORCER`, `RISK_AVERSE_ARTISAN`). This tunes the flavor of the critique to match the user's personality archetype, from a stern Zen master's rebuke to a rival syndicate boss's aggressive dismissal.
- **Input**: Accepts the `content` to be critiqued, the `contentType`, and the user's `psyche`.
- **Output (`DrSyntaxOutputSchema`)**: Returns a structured JSON object containing the `critique`, a suggested `suggestion`, and a numerical `rating` from 1 to 10.

### 2.2. The `DrSyntax` Micro-App (`micro-apps/dr-syntax.tsx`)
The UI provides a direct interface for submitting content for judgment.
- **Content Input**: A `Textarea` for the user to paste their content.
- **Type Selection**: A `Select` dropdown to specify whether the content is a `prompt`, `code`, or `copy`.
- **Execution**: A "Critique It" button triggers the `critiqueContent` tool via a BEEP command.
- **Verdict Display**: The UI renders the structured report from the agent, including the scathing critique, the helpful suggestion, and the final quality rating, color-coded for at-a-glance assessment.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: Dr. Syntax can be launched from the Canvas or summoned via a BEEP command like, "Ask Dr. Syntax to review this prompt."
- **Agentic Control**: BEEP uses the `critiqueContent` tool to pass content to the agent for analysis.
- **Billing**: Every critique is a billable agent action, debited from the workspace balance by Obelisk Pay.
- **The Armory**: As a high-value utility for developers, writers, and prompt engineers, Dr. Syntax is listed in The Armory as a premium, one-time purchase.
