# ΛΞVON OS: Technical Briefing

This document provides a concise, high-level overview of the ΛΞVON OS codebase for rapid context transfer.

---

### 1. 🏗️ Project Summary

*   **Name**: ΛΞVON OS (Aevon OS)
*   **Purpose**: An agentic operating system designed for SMBs and sovereign operators. It replaces traditional UIs with a conversational command core (BEEP) and a modular canvas of "Micro-Apps." Key themes are automation, a gamified internal economy (ΞCredits), and a strong, unique brand identity.
*   **Tech Stack**:
    *   **Framework**: Next.js (App Router)
    *   **Language**: TypeScript
    *   **UI**: React, ShadCN UI, Tailwind CSS
    *   **AI/Agents**: Genkit, LangGraph, Groq (for LLM inference)
    *   **Database**: PostgreSQL (via Neon) with Prisma ORM
    *   **Authentication**: Firebase
    *   **State Management**: Zustand (client-side), Redis (server-side caching)
*   **Deployment**: Production environment is Vercel. Firebase App Hosting is also configured.

---

### 2. 📁 File/Module Structure

*   **/src/app**: Core Next.js App Router. Contains all pages (`page.tsx`) and API routes (`api/**/route.ts`).
*   **/src/components**: All React components.
    *   `components/micro-apps`: Contains the UI for each individual Micro-App.
    *   `components/ui`: ShadCN UI components.
    *   `components/layout`: Main layout components like the `TopBar` and `BottomNavBar`.
*   **/src/ai**: The heart of the agentic system.
    *   `ai/agents`: Defines the logic for the central `BEEP` orchestrator (using LangGraph) and all specialized agents (e.g., `DrSyntax`, `WinstonWolfe`).
    *   `ai/tools`: Reusable functions (e.g., `crm-tools`, `finance-tools`) that agents can invoke.
*   **/src/services**: Backend business logic that is not directly an agent tool (e.g., `billing-service`, `ledger-service`, `pulse-engine-service`).
*   **/src/store**: Contains the global client-side state manager (`app-store.ts`) using Zustand.
*   **/prisma**: Contains the `schema.prisma` file defining the database models, along with seeding scripts.
*   **/docs**: Extensive markdown documentation covering architecture, subsystems, and the project's philosophy.

---

### 3. 🧠 Core Logic & Flow

1.  **Authentication**: User authenticates via Firebase on the `/login` page. A session cookie is set via `/api/auth/session` for server-side validation.
2.  **Main Interface**: The root `page.tsx` serves as the main "Canvas," managed by the `app-store`.
3.  **Command Execution**:
    *   User types a command into the `TopBar`'s input field.
    *   The `app-store`'s `handleCommandSubmit` function is called.
    *   This function invokes a Server Action (`/src/app/actions.ts`), which calls the central `BEEP` agent (`/src/ai/agents/beep.ts`).
4.  **Agent Orchestration**:
    *   The `BEEP` agent, a `LangGraph` state machine, parses the command.
    *   It determines which tool(s) to use from the `tool-registry.ts`.
    *   Tools can be simple functions or calls to other specialized agents.
    *   The results from the tools are passed back to `BEEP`, which synthesizes a final response.
5.  **State Update & UI Render**:
    *   The response from `BEEP` is passed back to the `app-store`.
    *   The store updates its state, which can include launching new Micro-Apps, updating existing ones, or displaying notifications.
    *   The React UI re-renders based on the new state.

---

### 4. ⚙️ Key Features & Functionality

*   **BEEP Agent**: The central conversational orchestrator that understands natural language and delegates tasks to a swarm of specialized agents.
*   **Micro-App Canvas**: A dynamic, draggable, and resizable interface where modular applications are launched and managed.
*   **ΞPITOME Economy**: A dual-layer economy. A predictable platform fee is paired with a closed-loop internal currency (`ΞCredits`) spent in The Armory and on gamified "Folly Instruments".
*   **Klepsydra Engine**: A gamified "luck" system (`pulse-engine-service` and `folly-instruments.ts`) that modulates the outcomes of chance-based Micro-Apps.
*   **Loom Studio**: A visual workflow editor for creating and managing agentic automations.

---

### 5. 🪓 Pain Points & Complexity

*   **The BEEP Monolith**: The `beep.ts` agent is the single brain for the entire OS. Its LangGraph implementation is vast and complex, making it a central point of failure and a challenge to debug.
*   **The App Store Monolith**: Similarly, `app-store.ts` handles almost all client-side logic, from submitting commands to processing agent reports. It's a complex piece of state management.
*   **Mocked Services**: Many agent tools are currently mocked (e.g., Slack, financial data APIs). Replacing these with live implementations will require significant effort.
*   **Implicit Dependencies**: The system relies heavily on specific string matching for BEEP to invoke the correct tools. Changes to tool names or descriptions can break functionality in non-obvious ways.

---

### 6. 📦 Inputs & Outputs

*   **Primary Input**: Natural language text commands from the user.
*   **Other Inputs**: File uploads (for `PaperTrail`), external API data (mocked).
*   **Primary Output**: Changes to the UI state (launching Micro-Apps), generated text and audio from agents.
*   **External Services Used**: Firebase (Auth), Neon (Database), Vercel (Hosting), Groq (LLM Inference), Google AI (Genkit platform).

---

### 7. 🧪 Testing & Coverage

*   **E2E Tests**: The project has a Playwright E2E test suite defined in `e2e/app.spec.ts`.
*   **CI**: A GitHub Actions workflow (`.github/workflows/playwright.yml`) is configured to run these tests on push/PR to `main`.
*   **Unit/Integration Tests**: There are currently no unit or integration tests in the codebase. Test coverage is very low.
*   **How to Run**: `npm run test:e2e`

---

### 8. 🚀 Dev & Run Instructions

1.  **Install Dependencies**: `npm install`
2.  **Setup Database**: Ensure the `DATABASE_URL` in `.env` is correct. Run `npx prisma generate`, `npx prisma migrate dev`, and `npx prisma db seed`.
3.  **Run AI Services**: In a separate terminal, run `npm run genkit:dev` to start the Genkit development server.
4.  **Run Application**: In another terminal, run `npm run dev` to start the Next.js development server.
5.  **Environment Variables**: The project requires `DATABASE_URL`, `GOOGLE_API_KEY`, `GROQ_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_KEY`, and all `NEXT_PUBLIC_FIREBASE_*` variables to be set in a `.env` file.

---

### 9. 📚 Documentation Score

*   **Strengths**: The `/docs` directory contains extensive, high-quality documentation on the project's architecture, philosophy, and core subsystems. The API specification is well-defined in `api-spec.md`. Agent prompts are descriptive and self-documenting.
*   **Weaknesses**: Inline code comments are sparse. There is no single "Getting Started" guide for developers that consolidates the setup and run instructions. The connection between BEEP commands and the specific tools they trigger is not explicitly documented.
