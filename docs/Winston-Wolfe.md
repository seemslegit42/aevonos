# The Winston Wolfe: The Fixer - Technical Specification

> "I'm Winston Wolfe. I solve problems."

---

## 1. System Overview

The Winston Wolfe is a **specialized reputation management Micro-App**. It embodies the persona of "The Fixer" from the movie *Pulp Fiction*: calm, direct, professional, and brutally efficient.

It is designed to take a negative online review or customer complaint and generate the single, perfect response to de-escalate the situation, take responsibility, and "solve the problem."

---

## 2. Core Components & Implementation

### 2.1. The `winston-wolfe-agent` (`agents/winston-wolfe.ts`)
The agent's logic is powered by the `generateSolution` flow.
- **Persona-Driven Prompt**: The core prompt instructs the LLM to adopt Winston Wolfe's calm, direct, and disarming tone. It is explicitly told to not be defensive, to acknowledge the problem, and to offer a simple, effective solution.
- **Input**: Accepts the `reviewText` of the negative review.
- **Processing**: A single LLM call analyzes the review and generates the ideal `suggestedResponse`.
- **Output (`WinstonWolfeOutputSchema`)**: Returns a structured JSON object containing only the generated response text.

### 2.2. The `TheWinstonWolfe` Micro-App (`micro-apps/winston-wolfe.tsx`)
The UI is a clean, minimalist interface for problem-solving.
- **Input**: A `Textarea` for the user to paste the negative review or complaint.
- **Execution**: A "Call The Fixer" button triggers the `solveReputationProblem` tool via a BEEP command.
- **Result Display**: The UI displays the agent's `suggestedResponse` in a clean `Alert` component, allowing the user to easily copy it for use.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "I have a situation. Call Winston Wolfe."
- **Agentic Control**: BEEP uses the `solveReputationProblem` tool to pass the review text to the agent.
- **Billing**: Each consultation with The Fixer is a billable agent action, debited by Obelisk Pay.
- **The Armory**: As a high-value utility for any business with an online presence, The Winston Wolfe is listed as a premium, one-time purchase in The Armory.
