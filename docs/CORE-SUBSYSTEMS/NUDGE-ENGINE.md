# The Nudge Engine: The Art of the Whisper

> "A good system doesn't wait to be asked. It anticipates the need."

---

## 1. System Overview

The Nudge Engine is a **proactive, context-aware suggestion subsystem** within ΛΞVON OS. It operates silently in the background, observing user behavior to deliver timely, relevant, and often serendipitous "nudges" through the BEEP agent.

Its purpose is to create moments of delightful discovery, guide users toward untapped value, and reinforce the feeling that the OS is not just a tool, but an attentive partner in the user's journey. It is a key component in optimizing for **Return on Belief (RoB)** by rewarding curiosity and intent.

## 2. Mental Model

> The Nudge Engine is BEEP's intuition. It's the whisper in your ear suggesting a path you almost took, turning forgotten curiosity into action. It has no UI of its own; its existence is only known through the timely suggestions it surfaces.

---

## 3. Core Components & Implementation

### 3.1. The `InstrumentDiscovery` Table
This is the heart of the Nudge Engine. It is a simple, powerful log that records the "first contact" a user has with any acquirable item in The Armory.
- **`userId` & `workspaceId`**: Scopes the discovery event.
- **`instrumentId`**: The ID of the `MicroApp` or `ChaosCard` that was viewed.
- **`firstViewedAt`**: Timestamp of the initial discovery.
- **`converted`**: A boolean flag, set to `true` when the user acquires the instrument.
- **`dtt` (Discovery-to-Tribute Time)**: The time in minutes between first view and acquisition. This is a critical metric for measuring the effectiveness of an instrument's presentation and the user's conviction.
- **`nudgeSentAt`**: A timestamp to ensure we don't repeatedly nudge the user about the same item.

### 3.2. The Logging Mechanism (`app/actions.ts`)
- **`logInstrumentDiscovery` Action**: This is a "fire-and-forget" server action called by the frontend (e.g., `MicroAppListingCard.tsx`) via an `IntersectionObserver`. When an item scrolls into view for the first time, this action creates the log entry in the database.

### 3.3. The Nudge Generation (`app/actions.ts`)
- **`getNudges` Action**: This action is called periodically by the frontend. It queries the `InstrumentDiscovery` table for "ripe" opportunities:
  - Items that were viewed but not acquired.
  - A certain amount of time has passed since the initial view (e.g., 12 minutes).
  - A nudge has not already been sent for this item.
- **The Whisper**: If ripe discoveries are found, it crafts a simple, evocative message (e.g., "A strange energy coalesces around the Reno Mode™. It warrants investigation.") and returns it. The frontend is responsible for displaying this as a toast or a BEEP message.
- **State Update**: After generating a nudge, the action updates the `nudgeSentAt` timestamp to prevent spam.

---

## 4. Integration with the Doctrine of Sovereign Systems

The Nudge Engine is a direct implementation of the principle of **optimizing for Return on Belief**. By observing user intent (viewing an item) and gently reminding them of it later, it creates a feedback loop that feels personal and intelligent, not like a crude marketing pop-up.

It turns the act of browsing The Armory from a passive shopping trip into the beginning of a story. The engine remembers what caught the user's eye and, at the perfect moment, whispers a reminder, transforming a forgotten impulse into a potential new chapter in the user's journey with the OS.
