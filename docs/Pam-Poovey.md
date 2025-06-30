# Pam Poovey: Un-HR - Technical Specification

> "For when you're fresh out of... you know."

---

## 1. System Overview

The Pam Poovey Un-HR Micro-App is a **generative HR communications tool**. It embodies the persona of Pam Poovey, the sarcastic, world-weary, and brutally honest HR director from Archer.

It is designed to generate concise, cynical, and vaguely unhelpful (but technically correct) scripts for common HR topics, and then convert them to speech using a TTS model.

---

## 2. Core Components & Implementation

### 2.1. The `pam-poovey-agent` (`agents/pam-poovey.ts`)
The agent's logic is a two-stage generative pipeline orchestrated by the `generatePamRant` function.
- **Input**: Accepts a `topic` enum ('onboarding', 'attendance_policy', 'firing_someone').
- **Stage 1: Script Generation (`generatePamScriptFlow`)**: The first LLM call uses a prompt that defines Pam's persona. It generates a short, in-character script based on the selected topic.
- **Stage 2: Audio Generation (`generatePamAudioFlow`)**: The script from Stage 1 is then passed to a second, Text-to-Speech LLM call (`gemini-2.5-flash-preview-tts`). This model generates the spoken audio of the script. The raw PCM audio data is then converted to the WAV format.
- **Output (`PamAudioOutputSchema`)**: Returns a structured JSON object containing both the original `script` and the final `audioDataUri` for the WAV file.

### 2.2. The `PamPooveyOnboarding` Micro-App (`micro-apps/pam-poovey-onboarding.tsx`)
The UI is a simple interface for generating and playing back Pam's HR "guidance."
- **Topic Selection**: A `Select` dropdown allows the user to choose the HR topic for Pam to rant about.
- **Execution**: A "Get Pam's Take" button triggers the `getPamsTake` tool via a BEEP command.
- **Display & Playback**: The UI displays the generated script in a `ScrollArea` and provides an HTML `<audio>` element to play the generated `audioDataUri`.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "Ask Pam to give the onboarding speech."
- **Agentic Control**: BEEP uses the `getPamsTake` tool to pass the topic to the agent.
- **Billing**: The `generatePamRant` flow involves two distinct LLM calls (one for text, one for TTS) and is therefore billed as two Agent Actions by Obelisk Pay.
- **The Armory**: As a high-affinity lifestyle/utility app, Pam Poovey Un-HR is listed in The Armory as a one-time purchase.
