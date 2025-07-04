
# Pam Poovey: Un-HR - Technical Specification

> "Holy shitsnacks! You guys need HR? Fine. Let's get this over with."

---

## 1. System Overview

Pam Poovey: Un-HR is a **satirical HR and entertainment Micro-App** that generates brutally honest, sarcastic, and vaguely unhelpful HR scripts in the voice of Pam Poovey from Archer. It also includes Text-to-Speech (TTS) capabilities to bring her rants to life.

This is a tool for comedic relief, perfect for teams that understand that sometimes, the best HR is no HR.

---

## 2. Core Components & Implementation

### 2.1. The `pam-poovey-agent` (`agents/pam-poovey.ts`)
The agent is composed of two interconnected Genkit flows.
- **`generatePamScriptFlow`**: Takes a `topic` ('onboarding', 'attendance_policy', etc.) and uses a primary LLM call to generate a short, cynical `script` in Pam's voice.
- **`generatePamAudioFlow`**: Takes the generated `script` and uses a second, TTS-specific LLM call to generate a base64 encoded audio `audioDataUri` of the rant.
- **Caching**: The agent uses a simple in-memory cache (`pam-poovey-cache.ts`) for common topics to reduce LLM calls, demonstrating a key-value caching strategy.

### 2.2. The `PamPooveyOnboarding` Micro-App (`micro-apps/pam-poovey-onboarding.tsx`)
The UI is a simple console for generating and listening to Pam's "HR wisdom."
- **Topic Selection**: A `Select` dropdown allows the user to choose from a list of pre-defined HR topics.
- **Execution**: A "Get Pam's Take" button triggers the main `generatePamRant` tool via a BEEP command.
- **Playback**: The UI displays the generated script in a scrollable area and provides an HTML audio player to listen to the generated TTS rant.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "ask Pam about the attendance policy."
- **TTS Demonstration**: This app serves as a prime example of the OS's native Text-to-Speech capabilities.
- **Billing**: Each rant generation is a high-value process, consuming credits for both a `SIMPLE_LLM` call and a `TTS_GENERATION` call, debited by Obelisk Pay.
- **The Armory**: As a featured entertainment utility, Pam Poovey: Un-HR is available in The Armory for a one-time purchase.
