
# Covenant Systems: Technical Specification

> “Community is not a feature. It is a consequence of shared ritual.”

---

## 1. System Overview

The Covenant System is the technical implementation of Pillar III of the Doctrine of Sovereign Systems: the weaponization of community. It transforms the user base from a monolithic collection of individuals into a dynamic, multi-layered society of **Acolytes**, bound by shared vows and purpose.

This system is not a traditional "social feature." It is a deep, architectural layer designed to foster sacred belonging, drive cohort-specific engagement, and create an uncopyable cultural moat.

---

## 2. Data Model & Architecture

The foundation of the Covenant System is the `User.psyche` field, populated during the Rite of Invocation. This is the immutable key that assigns a user to their Covenant.

### 2.1. Covenant Identification
- **Syndicate Enforcer** -> **Covenant of Motion** (Symbol: 🜁)
- **Risk-Averse Artisan** -> **Covenant of Worship** (Symbol: 🜃)
- **Zen Architect** -> **Covenant of Silence** (Symbol: 🜄)

These are logical groupings derived from the `psyche` enum, allowing for rapid, low-overhead implementation.

---

## 3. System Integration & Implementation

### 3.1. UI/UX Personalization (Phase 1)
The most immediate manifestation of the Covenant System is in the UI.

- **Thematic Overrides**: The `RootLayout` checks the authenticated user's `psyche`. Based on the Covenant, a specific CSS class is applied to the `<html>` tag (e.g., `theme-covenant-motion`). This allows for targeted styling via `globals.css`.
- **`Covenant of Silence`**: Will feature a minimalist theme with reduced motion, fewer notifications, and a focus on typography and negative space.
- **`Covenant of Motion`**: Will feature more dynamic animations, real-time data visualizations in Micro-Apps, and a more vibrant, energetic color palette.
- **`Covenant of Worship`**: Will feature UI elements designed for "altar displays" (e.g., showcasing acquired Chaos Cards) and a visual language that emphasizes artifact collection and achievement.

### 3.2. Agentic Personalization (Phase 1)
- **BEEP Agent**: The `processUserCommand` function in `beep.ts` already receives the user's `psyche`. BEEP's persona, tone, and even the *types* of suggestions it makes will be tuned to the user's Covenant.
  - **Motion**: BEEP is direct, action-oriented, and suggests shortcuts.
  - **Worship**: BEEP is meticulous, reassuring, and confirms actions.
  - **Silence**: BEEP is minimal, precise, and speaks only when necessary.
- **Other Agents**: Agents like Dr. Syntax are already psyche-aware. This pattern will be extended to other agents where appropriate.

### 3.3. Community Infrastructure (Implemented)
- **API Endpoints**:
  - `GET /api/covenants/me`: Returns the user's Covenant info, including symbol and name.
  - `GET /api/covenants/{covenantName}/members`: (Admin-only) Returns members of a specific Covenant.
  - `GET /api/covenants/{covenantName}/leaderboard`: Returns a leaderboard based on Vow Alignment Score (VAS).
- **Admin Console Integration**: The `Admin Console` Micro-App now features a "Covenants" tab that visualizes each Covenant's member roster and leaderboard, providing the Architect with a clear view of their community's structure and alignment.
- **Ritual Quests**: BEEP generates and assigns cohort-specific challenges ("Ritual Quests") designed to increase the Vow Alignment Score (VAS) of Covenant members.

---

## 4. Measuring Success: The Vow Alignment Score (VAS)

The VAS is a key component of Return on Belief (RoB). It is calculated by the `vas-service.ts` by analyzing a user's recent `Transaction` history.

- **Example Calculation**:
  - A member of the **Covenant of Motion** runs multiple workflows in parallel and uses high-velocity Micro-Apps. -> **High VAS**.
  - A member of the **Covenant of Silence** frequently uses the `Vandelay` alibi generator and has minimal, high-impact agent interactions. -> **High VAS**.
  - A user's actions consistently contradict their chosen psyche. -> **Low VAS**, triggering a gentle, corrective nudge from BEEP.

The Covenant System is the engine that turns individual users into a cohesive, devoted, and evangelistic culture. It is the ultimate defense against commoditization.
