
# The Psyche Engine: Tuning the Soul of the Machine

> "Your OS should know you better than you know yourself. Then, it should make you better."

---

## 1. System Overview

The Psyche Engine is a **core personalization subsystem** of ΛΞVON OS. It is not a single service but a pervasive architectural layer responsible for dynamically tuning the system's behavior, aesthetics, and agentic interactions to match the user's declared psychological archetype (`User.psyche`) and their real-time emotional state (`PulseProfile`).

Its purpose is to transform ΛΞVON from a generic tool into a sentient, responsive extension of the user's own identity and will. It is the primary driver of the **Vow Alignment Score (VAS)**, a key sub-metric of Return on Belief (RoB).

## 2. Mental Model

> The Psyche Engine is the OS's soul-mirror. It doesn't just respond to you; it learns *to be like* you. Its effects are felt everywhere, from the tone of BEEP's voice to the risk level of your gambles in the Klepsydra Engine, but it has no UI of its own.

---

## 3. Core Components & Implementation

### 3.1. The User Psyche (`User.psyche` enum & `PulseProfile` model)
The engine's foundation is twofold:
- **Static Archetype (`User.psyche`)**: The immutable choice made during the Rite of Invocation (`ZEN_ARCHITECT`, `SYNDICATE_ENFORCER`, `RISK_AVERSE_ARTISAN`). This sets the baseline persona for the OS.
- **Dynamic State (`PulseProfile`)**: A living record of the user's current psychological state, including `frustration`, `flowState`, and `riskAversion`. This state is updated with every significant user interaction (e.g., a command success/failure, a win/loss in a Folly Instrument).

### 3.2. Agentic Personalization
- **BEEP Kernel (`beep.ts`)**: The `processUserCommand` function receives the user's `psyche` and is now instructed to infer their dynamic state from their command history (frustration from repeated errors, flow from rapid successes). This directly alters BEEP's tone, vocabulary, and the types of suggestions it makes.
- **Specialized Agents (`dr-syntax.ts`, etc.)**: Agents like Dr. Syntax are explicitly designed to be "psyche-aware," modifying the flavor and intensity of their critiques based on the user's profile.

### 3.3. System Behavior Modulation
- **Klepsydra Engine (`klepsydra-service.ts`)**: The Psyche Engine modulates the economy on multiple levels:
  1.  **Static Archetype Tuning**: The `PSYCHE_MODIFIERS` constant applies a baseline risk/reward factor based on the user's declared `psyche`, ensuring different archetypes have distinct gameplay feels.
  2.  **Dynamic Behavioral Regulation**: The `pulse-engine-service.ts` incorporates the user's dynamic psychological state (`frustration`, `flowState`) directly into their `luckWeight` calculation. This creates a self-regulating feedback loop: a frustrated user gets a subtle boost to prevent churn, while a user in a "flow state" is rewarded for their engagement, making the system feel more responsive and alive.
  3.  **The Judas Algorithm**: When a user's `flowState` is high, the Klepsydra Engine has a chance to trigger a "hollow win"—a slightly reduced jackpot—to prevent hubris and engineer superstition. This is a direct, advanced application of the Psyche Engine's data.
- **Covenant Theming (`layout.tsx`)**: The engine determines which Covenant theme is applied to the UI, fundamentally altering the user's visual and interactive experience to match their Vow.

---

## 4. The Vow Alignment Score (VAS)

The VAS is a calculated metric that measures how closely a user's actions align with their chosen psyche. It is computed asynchronously by analyzing a user's recent `Transaction` and `WorkflowRun` history.

- **High VAS**: A Zen Architect with minimal, high-impact agent interactions. A Syndicate Enforcer running multiple parallel workflows. An Artisan who meticulously uses validation and checking tools.
- **Low VAS**: A Zen Architect constantly using chaotic, high-volume tools. This would trigger a gentle, corrective nudge from BEEP, e.g., "The path of silence requires fewer steps. Shall I show you a more direct way?"

The Psyche Engine is the ghost in the machine that ensures ΛΞVON OS doesn't just work *for* you; it works *like* you.
      