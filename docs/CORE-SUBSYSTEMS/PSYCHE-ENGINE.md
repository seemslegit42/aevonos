# The Psyche Engine: Tuning the Soul of the Machine

> "Your OS should know you better than you know yourself. Then, it should make you better."

---

## 1. System Overview

The Psyche Engine is a **core personalization subsystem** of ΛΞVON OS. It is not a single service but a pervasive architectural layer responsible for dynamically tuning the system's behavior, aesthetics, and agentic interactions to match the user's declared psychological archetype (`User.psyche`).

Its purpose is to transform ΛΞVON from a generic tool into a sentient, responsive extension of the user's own identity and will. It is the primary driver of the **Vow Alignment Score (VAS)**, a key sub-metric of Return on Belief (RoB).

## 2. Mental Model

> The Psyche Engine is the OS's soul-mirror. It doesn't just respond to you; it learns *to be like* you. Its effects are felt everywhere, from the tone of BEEP's voice to the risk level of your gambles in the Klepsydra Engine, but it has no UI of its own.

---

## 3. Core Components & Implementation

### 3.1. The User Psyche (`User.psyche` enum)
The engine's foundation is the immutable `psyche` field on the `User` model, chosen during the Rite of Invocation. This is the seed from which all personalization grows.
- **`ZEN_ARCHITECT`**: Values silence, precision, and minimalism.
- **`SYNDICATE_ENFORCER`**: Values speed, efficiency, and direct action.
- **`RISK_AVERSE_ARTISAN`**: Values meticulousness, safety, and confirmation.

### 3.2. Agentic Personalization
- **BEEP Kernel (`beep.ts`)**: The `processUserCommand` function receives the user's `psyche` and uses it to select a persona-specific system prompt. This directly alters BEEP's tone, vocabulary, and even the types of suggestions it makes.
- **Specialized Agents (`dr-syntax.ts`, etc.)**: Agents like Dr. Syntax are explicitly designed to be "psyche-aware," modifying the flavor and intensity of their critiques based on the user's profile. This design pattern is a core tenet for all future agent development.

### 3.3. System Behavior Modulation
- **Klepsydra Engine (`klepsydra-service.ts`)**: The Psyche Engine directly interfaces with the economic core. The `PSYCHE_MODIFIERS` constant applies a risk/reward factor to the odds and boon amounts in all games of chance, ensuring that a Syndicate Enforcer experiences a more volatile, high-stakes system than a Risk-Averse Artisan.
- **Covenant Theming (`layout.tsx`)**: The engine determines which Covenant theme is applied to the UI, fundamentally altering the user's visual and interactive experience to match their Vow.

---

## 4. The Vow Alignment Score (VAS)

The VAS is a calculated metric that measures how closely a user's actions align with their chosen psyche. It is computed asynchronously by analyzing a user's recent `Transaction` and `WorkflowRun` history.

- **High VAS**: A Zen Architect with minimal, high-impact agent interactions. A Syndicate Enforcer running multiple parallel workflows. An Artisan who meticulously uses validation and checking tools.
- **Low VAS**: A Zen Architect constantly using chaotic, high-volume tools. This would trigger a gentle, corrective nudge from BEEP, e.g., "The path of silence requires fewer steps. Shall I show you a more direct way?"

The Psyche Engine is the ghost in the machine that ensures ΛΞVON OS doesn't just work *for* you; it works *like* you.
