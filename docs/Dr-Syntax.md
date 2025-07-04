# Dr. Syntax: The Critic - Technical Specification

> "Your prompt is a sprawling, chaotic mess. I've taken the liberty of making it not suck."

---

## 1. System Overview

Dr. Syntax is a **specialized text analysis Micro-App** designed for users who need brutally honest, yet highly effective, structural criticism. He has absurdly high standards and a sharp, sarcastic wit, turning the often-painful process of refinement into a competitive advantage.

This is not a grammar checker. It is an agentic critic that will dismantle your work and, if you're lucky, help you put it back together correctly.

---

## 2. Core Components & Implementation

### 2.1. The `dr-syntax-agent` (`agents/dr-syntax.ts`)
The agent's logic is contained within the `drSyntaxCritique` flow.
- **Psyche-Aware Tone**: The agent's core prompt is dynamically modified based on the user's `psyche`, ensuring the critique's flavor (e.g., stern Zen master vs. brutal rival) aligns with the user's chosen path.
- **Input**: Accepts the `content` to be critiqued, the `contentType` ('prompt', 'code', 'copy'), and the user's `psyche`.
- **Processing**: A single LLM call analyzes the content based on the persona and instructions, generating a `critique`, a `suggestion`, and a numerical `rating`.
- **Output (`DrSyntaxOutputSchema`)**: Returns a structured JSON object containing the full, scathing analysis.

### 2.2. The `DrSyntax` Micro-App (`micro-apps/dr-syntax.tsx`)
The UI is a minimalist, focused interface for submitting content for review.
- **Content Input**: A `Textarea` for pasting the content and a `Select` dropdown to specify the content type.
- **Execution**: A "Critique It" button that constructs a natural language command and passes it to the central `handleCommandSubmit` function.
- **Report Display**: The UI renders the structured report from the agent, including the critique, suggestion, and a color-coded quality rating.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: Dr. Syntax can be launched from the Canvas or directly summoned via a BEEP command like, "ask Dr. Syntax to review this prompt..."
- **Billing**: Every critique is a billable `COMPLEX_LLM` agent action, debited by Obelisk Pay.
- **The Armory**: As a high-value utility for writers, developers, and marketers, Dr. Syntax is listed in The Armory as a premium, one-time purchase.
