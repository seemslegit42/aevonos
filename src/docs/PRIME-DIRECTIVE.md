# ΛΞVON OS: The Prime Directive

These are the absolute truths of the ΛΞVON OS architecture. All development must be in service of these principles.

## 1. Command-First Interface

-   Prioritize **NATURAL LANGUAGE** and **AGENTIC CONTROL**.
-   UI elements (Micro-Apps) exist to display agent output or gather complex input, not to define workflows.
-   All functionality must be executable through BEEP, the Behavioral Event & Execution Processor, via the central command bar.
-   Think “Talk to OS,” not “Click through UI.”

## 2. Contextual Awareness Everywhere

-   All micro-apps, workflows, and agents must adapt dynamically to user state, system context, and active workflows.
-   Inject, propagate, and honor **CONTEXT** (especially `userId` and `workspaceId`) through all layers — UI, API, services, and agent behavior.
-   No static assumptions. No hardcoded paths.

## 3. Visual Metaphors That Tell a Story

-   Replace static dashboards with **living metaphors**:
    -   Agent status as an energy flows/constellation network (`OracleBackground`).
    -   Business health as a metaphorical narrative (`Orphean Oracle`).
-   Visuals must feel organic, intentional, and symbolic — not utilitarian.

## 4. Humor & Irreverence Baked In

-   The OS has a **witty, sarcastic soul**. Embed it.
-   Use dry humor in tooltips, micro-interactions, and agent personas (e.g., Dr. Syntax, The Foremanator, J-ROC).
-   BEEP can break the fourth wall. Lean into it.
-   Easter eggs and “what the fuck?” moments are encouraged.

## 5. Mobile-First, But Fearless

-   The mobile experience is not a downscaled copy — it’s a **native-first reimagination**.
-   Use device capabilities:
    -   Voice input for agent tasking (`TopBar` microphone).
    -   Haptics for AEGIS alerts.
    -   A dedicated, persistent bottom navigation bar (`BottomNavBar`) for core actions.
-   The small screen must feel smarter, not smaller.

## 6. Tech + Design Immutables

-   **Tech stack**: TypeScript / Next.js / Tailwind CSS / ShadCN UI
-   **Database**: Prisma + Serverless PostgreSQL
-   **Agent orchestration**: Genkit & LangGraph
-   **Fonts**: Comfortaa (Headlines) + Lexend (Body)
-   **Visual Style**: Ancient Roman Glass + Digital Wabi-Sabi™
-   **No blue. Ever.** (Except where absolutely necessary for external branding).
-   **Micro-Apps**: Draggable, resizable, modular, runtime-registered on a dynamic Canvas.

Every file, function, and visual must reflect **the silence of true automation**.
