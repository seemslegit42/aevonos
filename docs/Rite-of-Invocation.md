
# The Rite of Invocation: Onboarding-as-Ritual - Technical Specification

> "A user does not 'sign up'. They perform a rite. They make a vow."

---

## 1. System Overview

The Rite of Invocation is the **ceremonial gateway** to ΛΞVON OS. It is a stateful, multi-phase component (`/register`) that replaces the mundane "sign-up form" with a secular ritual designed to bind a user's identity and intent to the system.

Its purpose is not merely to create an account, but to forge a pact. This is the first and most critical implementation of Pillar II of the Doctrine of Sovereign Systems: **Ritual-as-Product**.

---

## 2. Core Components & Implementation

### 2.1. The `RegisterPage` Component (`app/register/page.tsx`)
The Rite is orchestrated by a single, complex client component that uses `react-hook-form` for state management and `framer-motion` for cinematic, phase-based transitions.

-   **Phase One (The Sacrifice)**: The user is asked, *"What must end so you can begin?"* Their answer is captured as `whatMustEnd`. This initial step is designed to create a moment of reflection and personal investment, framing the adoption of the OS as a deliberate act of change.
-   **Phase Two (The Vow)**: The user is asked, *"Tell me what you're building."* Their core professional goal is captured as `goal`. This aligns their ambition directly with the OS's purpose as a tool for building sovereign enterprises.
-   **Phase Three (The Naming)**: The user is prompted, *"ΛΞVON is listening. But to act, it must be named."* They provide the name for their Canvas (`workspaceName`) and their primary agent (`agentAlias`). This act establishes ownership and personalizes the core interfaces. Discreet tooltips are provided to clarify what the "Canvas" and "Voice" are, without breaking the immersive flow.
-   **Phase Four (The Covenant)**: The user is told to *"Make your vow."* They choose one of three psychological archetypes (`UserPsyche`), which assigns them to a Covenant and provides the initial seed for the Psyche Engine.
-   **Phase Five (The Key)**: The user provides their `email` and `password` to forge their final credentials, completing the ritual.

### 2.2. The Registration Endpoint (`/api/auth/register/route.ts`)
This secure server-side endpoint handles the final submission of the Rite's data.

-   **Validation**: It uses a strict `Zod` schema to validate all incoming data from the form.
-   **Atomic Creation**: It uses a Prisma transaction (`$transaction`) to ensure that the creation of the `User`, their `Workspace`, and their initial `Transaction` (the genesis credit grant) is an all-or-nothing operation.
-   **Role Assignment**: The new user is automatically assigned the `ADMIN` role for their newly created workspace, granting them full authority from the moment they enter.
-   **Session Initiation**: Upon successful creation, it encrypts a JWT containing the `userId` and `workspaceId` and returns it as a secure session cookie, seamlessly transitioning the user into the OS.

---

## 3. Integration with ΛΞVON OS

-   **Invocation**: This is the sole entry point for new users, linked from the main `/login` page.
-   **Psyche Engine Seeding**: The `psyche` selected during the Rite is the foundational data point for the Psyche Engine, which tunes the entire OS's behavior, agent personas, and even UI themes to the user's chosen path.
-   **Onboarding as Doctrine**: This ritual is the embodiment of the platform's belief system. It is designed to maximize **Return on Belief (RoB)** and establish a deep user commitment from the very first interaction, turning "user acquisition" into "acolyte induction."
