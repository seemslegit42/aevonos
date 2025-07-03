# ΛΞVON OS: Micro-App Systems Analysis Report

This report provides a detailed breakdown of every identified Micro-App within the ΛΞVON OS codebase and its associated documentation. Each entry is analyzed according to its purpose, technical implementation, and integration within the broader agentic ecosystem.

## Table of Contents
1.  [Admin Console](#admin-console)
2.  [Aegis Command](#aegis-command)
3.  [Aegis ThreatScope](#aegis-threatscope)
4.  [Armory](#armory)
5.  [Auditor Generalissimo™](#auditor-generalissimo)
6.  [Barbara™](#barbara)
7.  [BEEP Wingman](#beep-wingman)
8.  [Command & Cauldron™](#command--cauldron)
9.  [Contact Editor](#contact-editor)
10. [Contact List](#contact-list)
11. [Dr. Syntax](#dr-syntax)
12. [The Foremanator™](#the-foremanator)
13. [Howard's Sidekick](#howards-sidekick)
14. [Infidelity Radar](#infidelity-radar)
15. [Integration Nexus](#integration-nexus)
16. [J-ROC'S LEGIT-AS-FRIG BUSINESS KIT™](#j-rocs-legit-as-frig-business-kit)
17. [KENDRA.exe](#kendraexe)
18. [The Kif Kroker](#the-kif-kroker)
19. [Lahey Surveillance Commander™](#lahey-surveillance-commander)
20. [Loom Studio](#loom-studio)
21. [The Lucille Bluth](#the-lucille-bluth)
22. [Merchant of Cabbage](#merchant-of-cabbage)
23. [Obelisk Marketplace](#obelisk-marketplace)
24. [Oracle of Delphi (Valley)](#oracle-of-delphi-valley)
25. [Orphean Oracle](#orphean-oracle)
26. [Pam Poovey: Un-HR](#pam-poovey-un-hr)
27. [Paper Trail P.I.](#paper-trail-pi)
28. [Patrickt™](#patrickt)
29. [Project Lumbergh](#project-lumbergh)
30. [Proxy.Agent](#proxyagent)
31. [Reno Mode™](#reno-mode)
32. [Ritual Quests](#ritual-quests)
33. [The Rolodex](#the-rolodex)
34. [Scribe's Archive](#scribes-archive)
35. [Sisyphus's Ascent](#sisyphuss-ascent)
36. [STERILE-ish™](#sterile-ish)
37. [Stonks Bot 9000](#stonks-bot-9000)
38. [Terminal](#terminal)
39. [Top-Up](#top-up)
40. [Usage Monitor](#usage-monitor)
41. [User Profile Settings](#user-profile-settings)
42. [Validator (Uncut Truth Engine)](#validator-uncut-truth-engine)
43. [Vandelay Industries](#vandelay-industries)
44. [VIN Diesel](#vin-diesel)
45. [The Winston Wolfe](#the-winston-wolfe)
46. [Workspace Settings](#workspace-settings)
47. [Summary & Analysis](#summary--analysis)

---

### Admin Console
1.  **Name**: Admin Console
2.  **Purpose**: A privileged dashboard for the Workspace Owner (Architect) to manage users, monitor system health, and view cohort data.
3.  **Primary Functionality**: Provides a tabbed interface for: viewing workspace overview stats, managing users and their roles (The Pantheon), monitoring agent status (Agent Muster), and viewing Covenant leaderboards and sacred vows.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Tabs`, `Card`, `Table`, `DropdownMenu`, `Dialog`), Recharts, `react-three-fiber`.
5.  **Key Files**:
    -   `/src/components/micro-apps/admin-console.tsx` (Main UI)
    -   `/src/components/micro-apps/admin-console/` (Child Tabs)
    -   `/src/app/api/admin/` (Associated API endpoints)
    -   `/src/app/admin/actions.ts` (Server Actions for mutations)
6.  **Dependencies**: Reads from nearly all core Prisma models (`User`, `Workspace`, `Agent`, `Transaction`). Fetches data via dedicated, secured API endpoints.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`. Invoked by BEEP command or from The Armory.
8.  **UI Components**: `AdminConsoleIcon`, `Tabs`, `Card`, `Table`, `Dialog`, 3D visualizations for the Pantheon.
9.  **Status**: Active.
10. **Documentation**: `docs/OPERATIONS/ADMIN-INSTRUMENTS.md`, `docs/Pantheon.md`, `docs/Covenant-Systems.md`.
11. **Internal Notes**: Described as "The Architect's Gaze," emphasizing that it's a mode of perception, not a simple panel. Access is strictly limited to the `owner` of a workspace.
12. **Security**: High. All backend APIs and server actions have stringent permission checks, ensuring only the Workspace Owner can access this data and perform mutations.
13. **Warnings**: None.

---

### Aegis Command
1.  **Name**: Aegis Command
2.  **Purpose**: Configuration console for the Aegis subsystem.
3.  **Primary Functionality**: Allows administrators to manage external threat intelligence feeds and define internal security edicts (rules of operation).
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Tabs`, `Button`, `Input`, `Textarea`, `Switch`).
5.  **Key Files**:
    -   `/src/components/micro-apps/aegis-command.tsx` (Main UI)
    -   `/src/app/api/security/threat-feeds/route.ts` (API endpoint)
    -   `/src/app/api/security/edicts/route.ts` (API endpoint)
6.  **Dependencies**: The `aegis` agent consumes the data configured here (`getThreatFeedsForWorkspace`, `getSecurityEdicts`).
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `AegisCommandIcon`, `Tabs`, `Input`, `Switch`.
9.  **Status**: Active.
10. **Documentation**: `docs/Aegis-Command.md`.
11. **Internal Notes**: "A shield is worthless without the eyes to see the blow coming." Emphasizes its role in directing Aegis's attention.
12. **Security**: High. Access is restricted to ADMIN and MANAGER roles to prevent unauthorized changes to the system's security posture.
13. **Warnings**: None.

---

### Aegis ThreatScope
1.  **Name**: Aegis ThreatScope
2.  **Purpose**: Provides a real-time, user-facing viewport for security alerts generated by the Aegis subsystem.
3.  **Primary Functionality**: Displays a reverse-chronological feed of security alerts, color-coded by risk level for immediate visual triage.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Alert`, `Badge`, `ScrollArea`), `date-fns`.
5.  **Key Files**:
    -   `/src/components/micro-apps/aegis-threatscope.tsx` (Main UI)
    -   `/src/app/api/security/alerts/route.ts` (API endpoint)
6.  **Dependencies**: Reads alerts created by the `aegis` agent via the `createSecurityAlertInDb` tool.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `AegisThreatScopeIcon`, `Alert`, `Badge`, `ScrollArea`.
9.  **Status**: Active.
10. **Documentation**: `docs/Aegis-ThreatScope.md`.
11. **Internal Notes**: Described as the "voice" of Aegis, translating its findings into an understandable format.
12. **Security**: Read-only. The security of the data is handled by the API endpoint, which scopes alerts to the authenticated user's workspace.
13. **Warnings**: None.

---

### Armory
1.  **Name**: The Armory
2.  **Purpose**: The central marketplace for users to browse and acquire all tools, agents, and artifacts (Micro-Apps, Chaos Cards).
3.  **Primary Functionality**: Displays listings for all available artifacts. Handles the acquisition flow by calling server actions, which debit ΞCredits and update user/workspace ownership records.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Tabs`, `Card`, `Button`, `ScrollArea`, `Input`, `Badge`).
5.  **Key Files**:
    -   `/src/components/micro-apps/armory.tsx` (Main UI)
    -   `/src/components/armory/` (Child components for listings)
    -   `/src/config/artifacts.ts` (Static catalog for all items)
    -   `/src/app/actions.ts` (`purchaseMicroApp`, `makeFollyTribute`)
6.  **Dependencies**: `ledger-service`, `klepsydra-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `ArmoryIcon`, `MicroAppListingCard`, `ChaosCardListingCard`.
9.  **Status**: Active.
10. **Documentation**: `docs/Armory.md`.
11. **Internal Notes**: "A tool is an extension of the will. Here is your arsenal." Positioned as a curated gallery, not just a store.
12. **Security**: The acquisition logic is handled by secure server actions that perform all necessary balance and ownership checks.
13. **Warnings**: None.

---

### Auditor Generalissimo™
1.  **Name**: The Auditor Generalissimo™
2.  **Purpose**: A specialized financial analysis agent that audits user-provided transaction data with a stern, sarcastic persona.
3.  **Primary Functionality**: Accepts a block of transaction text, analyzes it to generate a health score, burn rate, and a scathing roast, and audits each transaction with AI-generated tags and warnings.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Textarea`, `Button`, `Progress`, `Alert`), Genkit (TTS generation).
5.  **Key Files**:
    -   `/src/components/micro-apps/auditor-generalissimo.tsx` (Main UI)
    -   `/src/ai/agents/auditor-generalissimo.ts` (Agent logic)
    -   `/src/ai/agents/auditor-generalissimo-schemas.ts`
6.  **Dependencies**: `billing-service` (for debiting agent actions), `genkit/googleAI` TTS model.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `AuditorGeneralissimoIcon`, custom `HealthScoreDisplay`.
9.  **Status**: Active.
10. **Documentation**: `docs/Auditor-Generalissimo.md`.
11. **Internal Notes**: "You are guilty until proven solvent." Emphasizes the harsh-but-effective persona.
12. **Security**: Processes user-provided text data. The primary security concern is prompt injection, which is mitigated by the structured nature of the agent's task.
13. **Warnings**: None.

---

### Barbara™
1.  **Name**: Agent Barbara™
2.  **Purpose**: An administrative daemon for handling tedious, high-stakes compliance and documentation tasks.
3.  **Primary Functionality**: Accepts raw document text and a specific task (e.g., "validate VIN," "draft customs email"). The agent then processes the document, corrects it, identifies compliance issues, and provides a signature judgmental remark.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Textarea`, `Button`, `Select`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/barbara.tsx` (Main UI)
    -   `/src/ai/agents/barbara.ts` (Agent logic)
    -   `/src/ai/agents/barbara-schemas.ts`
6.  **Dependencies**: BEEP `processDocumentForBarbara` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `BarbaraIcon`, `Select`, `Textarea`, `Alert`.
9.  **Status**: Active.
10. **Documentation**: `docs/Barbara.md`.
11. **Internal Notes**: "The cold-souled admin angel of death." Her persona is key: passive-aggressive clairvoyance and bulletproof documentation.
12. **Security**: Processes user-provided text data. Mitigates prompt injection risk by using a predefined list of tasks rather than open-ended instructions.
13. **Warnings**: None.

---

### BEEP Wingman
1.  **Name**: BEEP Wingman
2.  **Purpose**: A specialized communication tool for navigating tricky social situations.
3.  **Primary Functionality**: Accepts a description of a social situation and a desired message style. It then generates a suggested message, a "cringe score," a social risk assessment ("vibe"), and a potential "Regret Shield" warning to delay sending.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Textarea`, `Button`, `Select`, `Alert`), Framer Motion.
5.  **Key Files**:
    -   `/src/components/micro-apps/beep-wingman.tsx` (Main UI)
    -   `/src/components/micro-apps/cringe-o-meter-dial.tsx` (Custom visual component)
    -   `/src/ai/agents/wingman.ts` (Agent logic)
    -   `/src/ai/agents/wingman-schemas.ts`
6.  **Dependencies**: BEEP `generateWingmanMessage` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `BeepWingmanIcon`, custom `CringeOMeterDial`.
9.  **Status**: Active.
10. **Documentation**: `docs/Beep-Wingman.md`.
11. **Internal Notes**: "He is not your assistant. He is your closer." Focuses on the "Cringe Detection Engine™" and "Regret Shield™" as core features.
12. **Security**: Low risk, as it primarily deals with user-provided situational text and generates suggested responses.
13. **Warnings**: None.

---

### Command & Cauldron™
1.  **Name**: Command & Cauldron™
2.  **Purpose**: A standalone, sovereign security ritual engine for enterprise-grade security policy enforcement.
3.  **Primary Functionality**: Allows high-tier users to compose and "consecrate" security spells (rituals) using a YAML-like syntax. These rituals can then be invoked by other agents (like Aegis) to enforce complex, custom security rules.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Textarea`, `Button`, `Input`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/command-and-cauldron.tsx` (Main UI)
6.  **Dependencies**: Relies on a (currently mocked) external API for ritual consecration and `billing-service` for debiting the significant costs.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `CommandAndCauldronIcon`, `Textarea` for code input.
9.  **Status**: In Progress / Partially Mocked.
10. **Documentation**: `docs/Command-And-Cauldron.md`.
11. **Internal Notes**: Explicitly defined as "NOT a Micro-App" in its nature, but rather an external power that the Micro-App UI provides a window into. Access is gated by the `Priesthood` plan and `ADMIN` role.
12. **Security**: Extremely high. Access is gated by plan and role. The core logic is intended to run in a separate, secure environment.
13. **Warnings**: The core backend functionality is currently mocked.

---

### Contact Editor
1.  **Name**: Contact Editor
2.  **Purpose**: A utility app for creating or editing a single contact record.
3.  **Primary Functionality**: Provides a simple form for contact details (name, email, phone). On submission, it constructs a natural language command for BEEP to process, rather than calling an API directly.
4.  **Tech Stack**: React, TypeScript, `react-hook-form`, `zod`, ShadCN UI (`Form`, `Input`, `Button`).
5.  **Key Files**:
    -   `/src/components/micro-apps/contact-editor.tsx` (Main UI)
6.  **Dependencies**: BEEP (`create` and `update` contact commands), `app-store`.
7.  **Registration**: `micro-app-registry.tsx`. This app is not in the `artifacts.ts` as it's not launched directly, but by the `Contact List` app.
8.  **UI Components**: `Edit` icon, `Form`, `Input`.
9.  **Status**: Active.
10. **Documentation**: `docs/CRM.md`.
11. **Internal Notes**: "On submit, the form does not call an API directly. Instead, it constructs a natural language command string." This is a key architectural pattern for maintaining a single, auditable path for mutations.
12. **Security**: Security is handled by the BEEP agent and its underlying CRM tools, which are scoped to the user's workspace.
13. **Warnings**: None.

---

### Contact List
1.  **Name**: Contact List
2.  **Purpose**: The primary visual interface for browsing contacts in the workspace.
3.  **Primary Functionality**: Fetches and displays a grid of all contacts for the current workspace. Allows users to initiate the creation of a new contact or the editing/deletion of an existing one.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Button`, `Avatar`, `Tooltip`, `AlertDialog`).
5.  **Key Files**:
    -   `/src/components/micro-apps/contact-list.tsx` (Main UI)
    -   `/src/components/micro-apps/contact-card.tsx` (Child component)
    -   `/src/app/api/contacts/route.ts` (API endpoint)
6.  **Dependencies**: `/api/contacts` endpoint for data fetching, `app-store` for launching the `Contact Editor` app.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `AddressBookIcon`, `ContactCard`.
9.  **Status**: Active.
10. **Documentation**: `docs/CRM.md`.
11. **Internal Notes**: A foundational utility. The primary interaction method should still be BEEP, with this app serving as a visual fallback.
12. **Security**: All data is fetched via a secure API endpoint scoped to the user's workspace.
13. **Warnings**: None.

---

### Dr. Syntax
1.  **Name**: Dr. Syntax
2.  **Purpose**: A specialized content analysis agent that provides harsh but effective critiques of prompts, code, or copy.
3.  **Primary Functionality**: Users submit content and its type. The agent returns a sarcastic critique, a constructive suggestion, and a quality rating from 1-10.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Textarea`, `Button`, `Select`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/dr-syntax.tsx` (Main UI)
    -   `/src/ai/agents/dr-syntax.ts` (Agent logic)
    -   `/src/ai/agents/dr-syntax-schemas.ts`
6.  **Dependencies**: BEEP `critiqueContent` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `DrSyntaxIcon`, `Select`, `Textarea`, `Alert`.
9.  **Status**: Active.
10. **Documentation**: `docs/Dr-Syntax.md`.
11. **Internal Notes**: The agent's persona is tuned based on the user's `psyche`, making the critiques feel personalized.
12. **Security**: Low risk. Processes user-provided text.
13. **Warnings**: None.

---

### The Foremanator™
1.  **Name**: The Foremanator™
2.  **Purpose**: An AI site commander that processes unstructured daily construction logs into professional, structured reports.
3.  **Primary Functionality**: Accepts raw text from a daily log. The agent parses it to extract a summary, tasks completed, materials used, any blockers, and provides a signature hard-nosed commentary.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Textarea`, `Button`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/the-foremanator.tsx` (Main UI)
    -   `/src/ai/agents/foremanator.ts` (Agent logic)
    -   `/src/ai/agents/foremanator-schemas.ts`
6.  **Dependencies**: BEEP `logDailyReport` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `ForemanatorIcon`, `Textarea`.
9.  **Status**: Active.
10. **Documentation**: `docs/The-Foremanator.md`.
11. **Internal Notes**: "He doesn't sleep. He doesn't eat. He just processes daily logs." The persona is key to the app's appeal.
12. **Security**: Low risk. Processes user-provided text.
13. **Warnings**: None.

---

### Howard's Sidekick
1.  **Name**: Howard's Sidekick
2.  **Purpose**: A loyal, simple utility app for tradespeople, providing reminders, a private note logger, and quick access to reference tools.
3.  **Primary Functionality**: Features a tabbed interface for viewing hardcoded daily reminders, logging private notes (client-side state only), and accessing an accordion of cheat sheets.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Tabs`, `Card`, `Accordion`, `Textarea`, `Button`).
5.  **Key Files**:
    -   `/src/components/micro-apps/howards-sidekick.tsx` (Main UI)
    -   `/src/app/globals.css` (Custom theme variables: `--sidekick-brown`, `--sidekick-gold`)
6.  **Dependencies**: None. This is a fully self-contained client-side app.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `HowardsSidekickIcon`, unique earthy/gold color scheme.
9.  **Status**: Active.
10. **Documentation**: `docs/Howards-Sidekick.md`.
11. **Internal Notes**: "A tribute to loyalty, companionship, and quiet support." Intended to build emotional connection.
12. **Security**: Very low risk, as all note-taking is ephemeral and client-side only. No data is sent to the server.
13. **Warnings**: None.

---

### Infidelity Radar
1.  **Name**: Spectre Intelligence Suite (Infidelity Radar)
2.  **Purpose**: A digital investigation console for relationship security, combining OSINT, behavioral analysis, and decoy deployment.
3.  **Primary Functionality**: Provides a tabbed interface to access multiple agentic tools: OSINT scanning on a target, behavioral analysis of a situation, deployment of AI decoys, and compilation of a final dossier. The "Burn Bridge Protocol" orchestrates all agents in sequence.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Tabs`, `Button`, `Input`, `Textarea`, `Alert`, `Progress`, `Accordion`).
5.  **Key Files**:
    -   `/src/components/micro-apps/infidelity-radar.tsx` (Main UI)
    -   `/src/components/micro-apps/infidelity-radar/` (Child panels for OSINT, export, etc.)
    -   `/src/ai/agents/osint.ts`
    -   `/src/ai/agents/infidelity-analysis.ts`
    -   `/src/ai/agents/decoy.ts`
    -   `/src/ai/agents/dossier-agent.ts`
    -   `/src/ai/agents/burn-bridge-agent.ts` (Orchestrator)
6.  **Dependencies**: BEEP, `billing-service`, multiple external data tools (mocked/live).
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `InfidelityRadarIcon`, various custom report panels.
9.  **Status**: Active.
10. **Documentation**: `docs/Infidelity-Radar.md`.
11. **Internal Notes**: A suite of tools, not a single agent. The "Burn Bridge Protocol" is the high-level orchestrator.
12. **Security**: High. Deals with potentially sensitive personal information. All tool use and data handling must be secure and compliant. The reliance on external OSINT APIs adds another layer of risk to manage.
13. **Warnings**: None.

---

### Integration Nexus
1.  **Name**: Integration Nexus
2.  **Purpose**: A command center for connecting and managing data flows with external third-party services.
3.  **Primary Functionality**: Allows admins to view configured integrations, add new ones from a manifest, and delete existing connections.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Button`, `Dialog`, `Input`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/integration-nexus.tsx` (Main UI)
    -   `/src/config/integration-manifests.ts` (Static catalog of available integrations)
    -   `/src/app/api/integrations/` (API endpoints for managing integrations)
6.  **Dependencies**: Backend API for CRUD operations on integration configurations.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `IntegrationNexusIcon`, `Dialog`.
9.  **Status**: Active.
10. **Documentation**: `docs/Integration-Nexus.md`, `docs/INTEROPERABILITY-ENGINE.md`.
11. **Internal Notes**: "The Conductor of Worlds." This app is the UI for the broader Interoperability Engine.
12. **Security**: High. Manages API keys and OAuth tokens for external services. Access is restricted to ADMINs.
13. **Warnings**: None.

---

### J-ROC'S LEGIT-AS-FRIG BUSINESS KIT™
1.  **Name**: J-ROC'S LEGIT-AS-FRIG BUSINESS KIT™
2.  **Purpose**: A generative branding tool that creates a business name, tagline, and logo with the persona of J-ROC.
3.  **Primary Functionality**: Users input a business type and logo style. The agent performs a two-stage generation: first, text generation for the name/tagline/logo description; second, image generation based on the description.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Input`, `Select`, `Button`), Genkit (image generation).
5.  **Key Files**:
    -   `/src/components/micro-apps/jroc-business-kit.tsx` (Main UI)
    -   `/src/ai/agents/jroc.ts` (Agent logic)
    -   `/src/ai/agents/jroc-cache.ts` (Caching for generated kits)
6.  **Dependencies**: BEEP `generateBusinessKit` tool, `billing-service`, `googleai/gemini-2.0-flash-preview-image-generation` model.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `JrocIcon`, `BoomBoxSpinner` loading state.
9.  **Status**: Active.
10. **Documentation**: `docs/Jroc-Business-Kit.md`.
11. **Internal Notes**: "It's all about supply and command, know'm sayin'?"
12. **Security**: Low risk. Image generation prompts are constructed from a controlled set of inputs.
13. **Warnings**: Relies on an experimental image generation model, which may be unstable or produce unexpected results.

---

### KENDRA.exe
1.  **Name**: KENDRA.exe
2.  **Purpose**: An unhinged marketing strategist AI that generates a complete viral marketing campaign from a single product idea.
3.  **Primary Functionality**: Takes a product idea and performs a two-stage generation: text generation for campaign title, hooks, ad copy, and hashtags; then image generation for a "cursed-but-perfect" ad image.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Textarea`, `Button`, `Alert`, `ScrollArea`), Genkit.
5.  **Key Files**:
    -   `/src/components/micro-apps/kendra.tsx` (Main UI)
    -   `/src/ai/agents/kendra.ts` (Agent logic)
    -   `/src/ai/agents/kendra-schemas.ts`
6.  **Dependencies**: BEEP `getKendraTake` tool, `billing-service`, image generation model.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `KendraIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Kendra.md`.
11. **Internal Notes**: "The brand is YOU. Even if it’s not. Especially if it’s not." Persona is key: 70% Chanel, 30% trauma.
12. **Security**: Low risk.
13. **Warnings**: Relies on an experimental image generation model.

---

### The Kif Kroker
1.  **Name**: The Kif Kroker
2.  **Purpose**: A communications analysis tool that monitors Slack channels for signs of conflict, passive-aggression, and burnout.
3.  **Primary Functionality**: User provides a Slack Channel ID. The agent fetches messages from that channel (via a tool) and analyzes the text to produce a morale level, passive-aggression index, burnout probability, and a "weary nudge" for a manager.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Input`, `Button`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/kif-kroker.tsx` (Main UI)
    -   `/src/ai/agents/kif-kroker.ts` (Agent logic)
    -   `/src/ai/tools/slack-tools.ts` (Data source)
6.  **Dependencies**: BEEP `analyzeTeamComms` tool, `billing-service`, `getSlackChannelMessages` tool.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `KifKrokerIcon`, custom `MoraleDisplay`.
9.  **Status**: Active.
10. **Documentation**: `docs/Kif-Kroker.md`.
11. **Internal Notes**: Persona is key: "long-suffering, passive AI observer."
12. **Security**: Requires access to potentially sensitive communications data from Slack. The integration must be secure and clearly disclose its function to users.
13. **Warnings**: The Slack integration is currently mocked.

---

### Lahey Surveillance Commander™
1.  **Name**: Lahey Surveillance Commander™
2.  **Purpose**: A chaotic-neutral productivity monitoring app with the persona of Jim Lahey.
3.  **Primary Functionality**: Analyzes employee activity logs to generate a "Shitstorm Index" and provides cynical, liquor-fueled commentary. The UI presents a dashboard of employee "risk" and a timeline of flagged events.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Progress`, `Alert`, `ScrollArea`), `date-fns`.
5.  **Key Files**:
    -   `/src/components/micro-apps/lahey-commander.tsx` (Main UI)
    -   `/src/ai/agents/lahey.ts` (Agent logic)
6.  **Dependencies**: BEEP `investigateLog` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `LaheyIcon`, `Progress` bar for Shitstorm Index.
9.  **Status**: Active (with mocked data).
10. **Documentation**: `docs/Lahey-Surveillance.md`.
11. **Internal Notes**: "I am the liquor." The app is purely for entertainment and satire.
12. **Security**: The concept implies employee monitoring, which has significant privacy and ethical implications. In a real-world scenario, this would require explicit consent and clear policies.
13. **Warnings**: All data in the UI is currently mocked.

---

### Loom Studio
1.  **Name**: Loom Studio
2.  **Purpose**: The native, privileged orchestration layer and visual command center for system architects and power users.
3.  **Primary Functionality**: A visual, drag-and-drop canvas for building, testing, and debugging complex agentic workflows using a node-based interface. Includes panels for node selection, property inspection, a real-time console, and execution history. Features a privileged "Architect View" for economic tuning.
4.  **Tech Stack**: React, TypeScript, `dnd-kit`, ShadCN UI (`Card`, `Button`, `Input`, `Dialog`, `Sheet`, `Accordion`).
5.  **Key Files**:
    -   `/src/app/loom/page.tsx` (Main UI and state management)
    -   `/src/components/loom/` (All child components for canvas, nodes, panels)
    -   `/src/lib/workflow-executor.ts` (Backend logic for running defined workflows)
6.  **Dependencies**: The entire agent and tool ecosystem, as any can be a node in a workflow.
7.  **Registration**: This is a core system page, not a dynamic Micro-App on the Canvas.
8.  **UI Components**: `LoomIcon`, custom canvas, node, and edge components.
9.  **Status**: Active.
10. **Documentation**: `docs/CORE-SUBSYSTEMS/LOOM-STUDIO.md`, `docs/LOOM-STUDIO/`.
11. **Internal Notes**: "It is NOT a Micro-App and does not reside on the user's Canvas; it is a separate, dedicated environment for system architects and power users."
12. **Security**: High. As it can define workflows that access sensitive data and tools, access must be strictly controlled by role (`ADMIN`, `MANAGER`). The backend executor must securely handle context and prevent privilege escalation.
13. **Warnings**: None.

---

### The Lucille Bluth
1.  **Name**: The Lucille Bluth
2.  **Purpose**: A financial utility app that provides judgmental, witty, and condescending commentary on user-logged expenses.
3.  **Primary Functionality**: Users log an expense description and amount. The agent returns a sarcastic remark and may suggest a more fitting, sarcastic category.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Input`, `Button`, `Alert`, `Switch`, `Tooltip`).
5.  **Key Files**:
    -   `/src/components/micro-apps/lucille-bluth.tsx` (Main UI)
    -   `/src/ai/agents/lucille-bluth.ts` (Agent logic)
    -   `/src/ai/agents/lucille-bluth-cache.ts` (Pre-computed cache)
6.  **Dependencies**: BEEP `getLucilleBluthTake` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `LucilleBluthIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Lucille-Bluth.md`.
11. **Internal Notes**: Features a monetization hook via the disabled "Portfolio Review Mode" switch.
12. **Security**: Low risk.
13. **Warnings**: None.

---

### Merchant of Cabbage
1.  **Name**: Merchant of Cabbage
2.  **Purpose**: A Folly Instrument for gamified economic engagement, themed around protecting a cabbage cart in a chaotic market.
3.  **Primary Functionality**: A slot machine-style game where users "tribute" ΞCredits for a chance to win a larger boon. The outcome is determined by the Klepsydra Engine.
4.  **Tech Stack**: React, TypeScript, Framer Motion, ShadCN UI (`Card`, `Button`, `Input`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/merchant-of-cabbage.tsx` (Main UI)
    -   `/src/app/actions.ts` (`makeFollyTribute`)
6.  **Dependencies**: `klepsydra-service`, `pulse-engine-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `MerchantOfCabbageIcon`, custom animated `Reel` component.
9.  **Status**: Active.
10. **Documentation**: `docs/folly-instruments.ts` (for odds).
11. **Internal Notes**: "My cabbages!!"
12. **Security**: Economic logic is handled securely on the backend.
13. **Warnings**: None.

---

### Obelisk Marketplace
1.  **Name**: Obelisk Marketplace
2.  **Purpose**: A privileged, high-tier marketplace for transmuting massive amounts of ΞCredits into curated, real-world assets and services.
3.  **Primary Functionality**: Displays a catalog of high-value offerings (e.g., hardware, consulting, equity). Users can "propose a tribute" which would trigger a real-world fulfillment process.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Button`, `Badge`, `Separator`).
5.  **Key Files**:
    -   `/src/components/micro-apps/obelisk-marketplace.tsx` (Main UI)
6.  **Dependencies**: The `Proxy.Agent` for handling the transmutation logic.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `ObeliskMarketplaceIcon`.
9.  **Status**: Active, but gated.
10. **Documentation**: `docs/Obelisk-Marketplace.md`, `docs/ECONOMY/OBELISK-PAY-SPEC.md`.
11. **Internal Notes**: "Where will is transmuted into reality." Access is gated by the `Priesthood` plan tier.
12. **Security**: Very high. Involves real-world financial transactions and fulfillment. The backend service for this would need to be exceptionally secure.
13. **Warnings**: The fulfillment logic is currently mocked.

---

### Oracle of Delphi (Valley)
1.  **Name**: Oracle of Delphi (Valley)
2.  **Purpose**: A Folly Instrument themed around venture capital, where users make tributes for a chance at a boon.
3.  **Primary Functionality**: A slot machine-style game where users tribute ΞCredits. Outcomes are determined by the Klepsydra Engine.
4.  **Tech Stack**: React, TypeScript, Framer Motion, ShadCN UI (`Card`, `Button`, `Input`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/oracle-of-delphi-valley.tsx` (Main UI)
    -   `/src/app/actions.ts` (`makeFollyTribute`)
6.  **Dependencies**: `klepsydra-service`, `pulse-engine-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `OracleOfDelphiValleyIcon`, custom animated `Reel` component.
9.  **Status**: Active.
10. **Documentation**: `docs/Oracle-of-Delphi-Valley.md`, `docs/folly-instruments.ts`.
11. **Internal Notes**: "Make your offering. Learn your fate."
12. **Security**: Economic logic is handled securely on the backend.
13. **Warnings**: None.

---

### Orphean Oracle
1.  **Name**: The Orphean Oracle
2.  **Purpose**: A specialized data visualization agent that translates raw business metrics into a metaphorical 3D "data constellation."
3.  **Primary Functionality**: User submits a query. The agent analyzes mock business data to generate a poetic summary, key insights, and parameters for the 3D visualization. The UI then renders this constellation using `react-three-fiber`.
4.  **Tech Stack**: React, TypeScript, `react-three-fiber`, `@react-three/drei`, ShadCN UI (`Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/orphean-oracle.tsx` (Main UI & 3D scene)
    -   `/src/ai/agents/orphean-oracle-flow.ts` (Agent logic)
6.  **Dependencies**: BEEP `invokeOrpheanOracle` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `OrpheanOracleIcon`, custom 3D `Node` and `Scene` components.
9.  **Status**: Active (with mocked data).
10. **Documentation**: `docs/Orphean-Oracle.md`.
11. **Internal Notes**: "I have descended into the underworld of your data. Here is the story I returned with."
12. **Security**: Low risk, as it currently operates on mocked data. In a live environment, it would require secure access to the user's actual business data.
13. **Warnings**: The data source is currently mocked.

---

### Pam Poovey: Un-HR
1.  **Name**: Pam Poovey: Un-HR
2.  **Purpose**: A generative HR communications tool with the persona of Pam Poovey.
3.  **Primary Functionality**: Generates cynical, sarcastic scripts for common HR topics (onboarding, firing, etc.) and then converts the script to speech using a TTS model.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Button`, `Select`, `ScrollArea`), Genkit (TTS).
5.  **Key Files**:
    -   `/src/components/micro-apps/pam-poovey-onboarding.tsx` (Main UI)
    -   `/src/ai/agents/pam-poovey.ts` (Agent logic)
    -   `/src/ai/agents/pam-poovey-cache.ts`
6.  **Dependencies**: BEEP `getPamsTake` tool, `billing-service`, `genkit/googleAI` TTS model.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `PamPooveyIcon`, standard HTML `<audio>` element.
9.  **Status**: Active.
10. **Documentation**: `docs/Pam-Poovey.md`.
11. **Internal Notes**: "For when you're fresh out of... you know."
12. **Security**: Low risk.
13. **Warnings**: None.

---

### Paper Trail P.I.
1.  **Name**: Paper Trail P.I.
2.  **Purpose**: An expense tracking app with a noir detective theme that uses a multimodal agent to analyze receipt photos.
3.  **Primary Functionality**: Users upload a photo of a receipt. The agent extracts the vendor, amount, and date, and provides a sharp, analytical "lead."
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Button`, `Input`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/paper-trail.tsx` (Main UI)
    -   `/src/ai/agents/paper-trail.ts` (Agent logic)
    -   `/src/app/actions.ts` (The `scanEvidence` server action)
6.  **Dependencies**: A dedicated server action (`scanEvidence`) to handle the file upload. This bypasses the typical BEEP command flow due to the data format.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `PaperTrailIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Paper-Trail.md`.
11. **Internal Notes**: "The receipts don't lie." Interaction is visual due to the image upload requirement.
12. **Security**: The app processes images, which could contain sensitive financial data. The transfer and processing must be secure.
13. **Warnings**: None.

---

### Patrickt™
1.  **Name**: Patrickt™
2.  **Purpose**: An emotional self-defense utility for logging and managing a specific, chaotic personal relationship.
3.  **Primary Functionality**: Allows users to log "Legendary Moments" of drama, categorizes them, and tracks a "Forgiveness Bank" and "Martyr Points." It's a gamified journaling app for a toxic relationship.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Textarea`, `Button`, `Select`, `Progress`).
5.  **Key Files**:
    -   `/src/components/micro-apps/patrickt.tsx` (Main UI)
    -   `/src/ai/agents/patrickt-agent.ts` (Agent logic)
6.  **Dependencies**: BEEP `managePatricktSaga` tool.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `PatricktIcon`, `Progress` bar.
9.  **Status**: Active (with mocked data).
10. **Documentation**: `docs/PATRICKT.md`.
11. **Internal Notes**: "The Martyr of Mayhem Micro-App." The event log is currently client-side and ephemeral.
12. **Security**: High privacy concern. In a real application, the logged events would be highly sensitive and require strong encryption and access controls.
13. **Warnings**: The event log is not persistent.

---

### Project Lumbergh
1.  **Name**: Project Lumbergh
2.  **Purpose**: A productivity tool that analyzes meeting invites for pointlessness and generates passive-aggressive decline memos.
3.  **Primary Functionality**: User pastes a meeting invite. The agent analyzes it for red flags (no agenda, buzzwords) and, if flagged, provides several pre-written, sarcastic decline messages.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Textarea`, `Button`, `Alert`, `Switch`, `Tooltip`).
5.  **Key Files**:
    -   `/src/components/micro-apps/project-lumbergh.tsx` (Main UI)
    -   `/src/ai/agents/lumbergh.ts` (Agent logic)
6.  **Dependencies**: BEEP `analyzeMeetingInvite` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `LumberghIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Project-Lumbergh.md`.
11. **Internal Notes**: "Yeeeeah, about those meetings..." Features a "Red Stapler Mode" monetization hook.
12. **Security**: Low risk. Processes user-provided text.
13. **Warnings**: None.

---

### Proxy.Agent
1.  **Name**: Proxy.Agent
2.  **Purpose**: A privileged agent for high-tier users to transmute ΞCredits into real-world payments.
3.  **Primary Functionality**: Presents a request to authorize a real-world payment, showing the cost in the local currency and the equivalent cost in ΞCredits plus a "Transmutation Tithe." Authorization triggers a secure server action.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Button`, `Separator`).
5.  **Key Files**:
    -   `/src/components/micro-apps/proxy-agent.tsx` (Main UI)
    -   `/src/app/actions.ts` (`transmuteCreditsViaProxy`)
    -   `/src/services/ledger-service.ts` (`transmuteCredits`)
6.  **Dependencies**: `ledger-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`. This app is typically summoned by another action, not launched directly.
8.  **UI Components**: `ProxyAgentIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/PROXY-AGENT.md`, `docs/CORE-SUBSYSTEMS/PROXY-AGENT.md`.
11. **Internal Notes**: "The bridge to the mundane world." The core logic is handled by a secure server action to prevent any client-side manipulation of payment amounts.
12. **Security**: Very high. This component initiates real-world financial transactions. The entire flow must be secure, atomic, and heavily audited. Access is restricted to workspace owners.
13. **Warnings**: None.

---

### Reno Mode™
1.  **Name**: Reno Mode™
2.  **Purpose**: A gamified, shame-neutralizing utility for getting users to clean their messy cars.
3.  **Primary Functionality**: User uploads a photo of their messy car interior. The multimodal agent analyzes the image and returns a "Shame Level" rating, a flirty roast, a cleanliness score, and a recommended detailing package.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Button`, `Input`, `Progress`, `Accordion`).
5.  **Key Files**:
    -   `/src/components/micro-apps/reno-mode.tsx` (Main UI)
    -   `/src/ai/agents/reno-mode.ts` (Agent logic)
6.  **Dependencies**: BEEP `analyzeCarShame` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `RenoModeIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/RENO-MODE.md`.
11. **Internal Notes**: "You dirty, filthy beast... let’s make you purr again."
12. **Security**: Processes user-uploaded images, which could contain personal information.
13. **Warnings**: None.

---

### Ritual Quests
1.  **Name**: Ritual Quests
2.  **Purpose**: A proactive engagement mechanic to guide users along their chosen path (Covenant) and increase their Vow Alignment Score (VAS).
3.  **Primary Functionality**: On launch, the app calls an agent to generate a list of personalized quests based on the user's psyche. Each quest has a title, description, reward, and a BEEP command that can be copied to begin the quest.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Button`, `ScrollArea`).
5.  **Key Files**:
    -   `/src/components/micro-apps/ritual-quests.tsx` (Main UI)
    -   `/src/ai/agents/ritual-quests-agent.ts` (Agent logic)
6.  **Dependencies**: BEEP `getRitualQuests` tool.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `RitualQuestsIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Ritual-Quests.md`.
11. **Internal Notes**: "A vow unacted is a vow broken." A key component for driving the VAS metric.
12. **Security**: Low risk.
13. **Warnings**: None.

---

### The Rolodex
1.  **Name**: The Rolodex
2.  **Purpose**: A recruiting utility that analyzes candidates against job descriptions to determine fit.
3.  **Primary Functionality**: A tabbed interface allows users to either paste a new candidate's summary or select an existing contact from their CRM. After providing a job description, the agent generates a fit score, an outreach icebreaker, and an AI summary.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Tabs`, `Input`, `Textarea`, `Button`, `Select`, `Progress`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/rolodex.tsx` (Main UI)
    -   `/src/ai/agents/rolodex.ts` (Agent logic)
6.  **Dependencies**: BEEP `analyzeCandidate` tool, `/api/contacts` endpoint for fetching existing contacts.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `RolodexIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Rolodex.md`.
11. **Internal Notes**: "Efficiency in recruitment is not about finding the best person. It's about disqualifying the wrong ones faster."
12. **Security**: Handles potentially sensitive PII from resumes. Data should be handled securely.
13. **Warnings**: None.

---

### Scribe's Archive
1.  **Name**: The Scribe's Archive (File Explorer)
2.  **Purpose**: A visual, agentic interface for knowledge management, replacing a traditional file system.
3.  **Primary Functionality**: Displays data as floating, interactive "data crystals." Hovering reveals metadata. The primary interaction is intended to be via BEEP commands (e.g., "BEEP, show me all contracts related to Project Chimera").
4.  **Tech Stack**: React, TypeScript, Framer Motion, ShadCN UI (`Card`, `Tooltip`).
5.  **Key Files**:
    -   `/src/components/micro-apps/file-explorer.tsx` (Main UI)
6.  **Dependencies**: BEEP for retrieval commands.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `FileExplorerIcon`, custom `DataCrystal` component.
9.  **Status**: Active (with mocked data).
10. **Documentation**: `docs/File-Explorer.md`.
11. **Internal Notes**: "This is not a file manager. This is a memory palace."
12. **Security**: Would require secure storage and retrieval for files in a live implementation.
13. **Warnings**: The file data is currently mocked. No actual file upload or retrieval is implemented.

---

### Sisyphus's Ascent
1.  **Name**: Sisyphus's Ascent
2.  **Purpose**: A Folly Instrument themed around the myth of Sisyphus, representing the struggle of building a business.
3.  **Primary Functionality**: A slot machine-style game where users "push" (tribute ΞCredits) for a chance to win a boon. Outcomes are determined by the Klepsydra Engine.
4.  **Tech Stack**: React, TypeScript, Framer Motion, ShadCN UI (`Card`, `Button`, `Input`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/sisyphus-ascent.tsx` (Main UI)
    -   `/src/app/actions.ts` (`makeFollyTribute`)
6.  **Dependencies**: `klepsydra-service`, `pulse-engine-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `SisyphusIcon`, custom animated `Reel` component.
9.  **Status**: Active.
10. **Documentation**: `docs/folly-instruments.ts` (for odds).
11. **Internal Notes**: "One must imagine Sisyphus happy."
12. **Security**: Economic logic is handled securely on the backend.
13. **Warnings**: None.

---

### STERILE-ish™
1.  **Name**: STERILE-ish™
2.  **Purpose**: A compliance analysis app for regulated industries, with an irreverent persona.
3.  **Primary Functionality**: Analyzes cleanroom log entries for compliance issues. Returns a boolean compliance status, snarky notes, a "Sterile Rating," and a summary for an audit report.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Textarea`, `Button`, `Select`, `Alert`, `Progress`).
5.  **Key Files**:
    -   `/src/components/micro-apps/sterileish.tsx` (Main UI)
    -   `/src/ai/agents/sterileish.ts` (Agent logic)
6.  **Dependencies**: BEEP `analyzeComplianceLog` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `SterileishIcon`, `Progress` bar.
9.  **Status**: Active.
10. **Documentation**: `docs/Sterileish.md`.
11. **Internal Notes**: "We're basically compliant."
12. **Security**: Low risk. Processes user-provided text.
13. **Warnings**: None.

---

### Stonks Bot 9000
1.  **Name**: Stonks Bot 9000
2.  **Purpose**: A financial entertainment app that provides unhinged, bullish "advice" on stocks.
3.  **Primary Functionality**: User enters a stock ticker and selects a persona. The agent fetches real-time stock data and then uses an LLM to generate a satirical analysis, horoscope, and rating.
4.  **Tech Stack**: React, TypeScript, Recharts, ShadCN UI (`Card`, `Input`, `Select`, `Button`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/stonks-bot.tsx` (Main UI)
    -   `/src/ai/agents/stonks-bot.ts` (Agent logic, LangGraph implementation)
    -   `/src/ai/tools/finance-tools.ts`
6.  **Dependencies**: BEEP `getStonksAdvice` tool, `billing-service`, `getStockPrice` tool.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `StonksIcon`, `StonksChartOfProphecy`, `StonkPulse`.
9.  **Status**: Active.
10. **Documentation**: `docs/Stonks-Bot.md`.
11. **Internal Notes**: "This is not financial advice. It is performance art." The UI dynamically changes theme color based on the stock's performance.
12. **Security**: The external finance API connections need to be secure. No user financial data is handled.
13. **Warnings**: None.

---

### Terminal
1.  **Name**: Terminal
2.  **Purpose**: A direct command-line interface (CLI) to the BEEP agent and core system commands.
3.  **Primary Functionality**: Provides a familiar terminal interface where users can type commands. All input is piped to the `handleCommandSubmit` function, with special handling for local commands like `clear` and `help`.
4.  **Tech Stack**: React, TypeScript, `zustand` (via `useAppStore`).
5.  **Key Files**:
    -   `/src/components/micro-apps/terminal.tsx` (Main UI)
6.  **Dependencies**: `app-store`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `TerminalIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Terminal.md`.
11. **Internal Notes**: "The invocation chamber." A key tool for power users.
12. **Security**: As it's a direct interface to BEEP, all security is handled by BEEP's Aegis pre-flight checks and the permissions of the underlying tools.
13. **Warnings**: None.

---

### Top-Up
1.  **Name**: Top-Up
2.  **Purpose**: A utility app for users to log a request to add ΞCredits to their workspace.
3.  **Primary Functionality**: Provides instructions for an out-of-band payment (e-Transfer) and a form for the user to select a credit pack. Submitting the form calls a server action that creates a `PENDING` transaction in the database.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Button`, `Label`).
5.  **Key Files**:
    -   `/src/components/micro-apps/top-up.tsx` (Main UI)
    -   `/src/app/actions.ts` (`requestCreditTopUp`)
6.  **Dependencies**: `requestCreditTopUp` server action.
7.  **Registration**: `micro-app-registry.tsx`. Launched from the `Usage Monitor`.
8.  **UI Components**: `TopUpIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Usage-Monitor.md`.
11. **Internal Notes**: This app creates a `PENDING` transaction, which must be confirmed by an admin in the `Usage Monitor` to finalize the credit addition.
12. **Security**: The `requestCreditTopUp` action is secured and includes an Aegis anomaly scan.
13. **Warnings**: None.

---

### Usage Monitor
1.  **Name**: Usage Monitor
2.  **Purpose**: A core utility app for tracking Agent Action consumption, viewing transaction history, and managing ΞCredit balance.
3.  **Primary Functionality**: Displays monthly agent action usage, credit balance, and a detailed, filterable log of all transactions. Admins can confirm pending credit top-ups from this interface.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Progress`, `Button`, `Badge`, `ScrollArea`, `Tabs`).
5.  **Key Files**:
    -   `/src/components/micro-apps/usage-monitor.tsx` (Main UI)
    -   `/src/app/api/billing/` (API endpoints)
6.  **Dependencies**: Multiple billing and transaction-related API endpoints.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `UsageMonitorIcon`, custom `StatCard`, custom `TransactionLog`.
9.  **Status**: Active.
10. **Documentation**: `docs/Usage-Monitor.md`.
11. **Internal Notes**: "The account is the anchor of sovereignty." It is the user-facing ledger for Obelisk Pay.
12. **Security**: High. Displays sensitive financial data and includes administrative actions. All API calls are secured and scoped to the user's workspace.
13. **Warnings**: None.

---

### User Profile Settings
1.  **Name**: User Profile Settings
2.  **Purpose**: A utility app for users to manage their own profile information.
3.  **Primary Functionality**: A simple form to update first name, last name, and agent alias. Also includes buttons for logout and account deletion. Displays the user's `PsycheMatrix`.
4.  **Tech Stack**: React, TypeScript, `react-hook-form`, `zod`, ShadCN UI (`Form`, `Input`, `Button`, `Dialog`), Framer Motion.
5.  **Key Files**:
    -   `/src/components/micro-apps/user-profile-settings.tsx` (Main UI)
    -   `/src/components/profile/psyche-matrix.tsx`
    -   `/src/app/api/users/me/route.ts` (API endpoint)
    -   `/src/app/auth/actions.ts`
6.  **Dependencies**: `/api/users/me`, `/api/user/pulse-profile`.
7.  **Registration**: `micro-app-registry.tsx`. Launched from the TopBar.
8.  **UI Components**: `UserSettingsIcon`, `PsycheMatrix`.
9.  **Status**: Active.
10. **Documentation**: `docs/Settings-Apps.md`.
11. **Internal Notes**: Data is pre-fetched and passed as props from the `TopBar` to improve performance.
12. **Security**: API endpoints are secured by session middleware. The "Delete Account" flow includes a "Rite of Reclamation" dialog for retention.
13. **Warnings**: None.

---

### Validator (Uncut Truth Engine)
1.  **Name**: Validator (Uncut Truth Engine)
2.  **Purpose**: A core security utility for client-side file integrity verification.
3.  **Primary Functionality**: Users drag and drop a file and paste an expected SHA256 hash. The app calculates the file's hash client-side and compares it to the input, showing a success or failure state.
4.  **Tech Stack**: React, TypeScript, `crypto-js`, ShadCN UI (`Button`, `Input`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/validator.tsx` (Main UI)
6.  **Dependencies**: `crypto-js`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `ValidatorIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Validator.md`.
11. **Internal Notes**: "The hash doesn't lie." The entire verification process is client-side to ensure user privacy and file security.
12. **Security**: Low risk, as no files are uploaded to the server.
13. **Warnings**: None.

---

### Vandelay Industries
1.  **Name**: Vandelay Industries
2.  **Purpose**: A productivity app that generates plausible, jargon-filled calendar invites to serve as alibis.
3.  **Primary Functionality**: User provides an optional topic hint and can toggle the inclusion of fake attendees. The agent generates a boring meeting title to help the user block off their calendar.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Input`, `Button`, `Alert`, `Switch`, `Tooltip`).
5.  **Key Files**:
    -   `/src/components/micro-apps/vandelay.tsx` (Main UI)
    -   `/src/ai/agents/vandelay.ts` (Agent logic)
    -   `/src/ai/agents/vandelay-cache.ts` (Caching)
6.  **Dependencies**: BEEP `createAlibi` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `VandelayIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Vandelay-Industries.md`.
11. **Internal Notes**: "Importing, exporting, and ghosting." Features a monetization hook for the "Plausible Attendees" feature.
12. **Security**: Low risk.
13. **Warnings**: None.

---

### VIN Diesel
1.  **Name**: VIN Diesel
2.  **Purpose**: A compliance and data-decoding app for validating Vehicle Identification Numbers.
3.  **Primary Functionality**: User enters a 17-character VIN. The agent calls an external API (NHTSA) to validate and decode the VIN, then generates an in-character status message and compliance report.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Input`, `Button`, `Alert`, `Progress`, `Collapsible`, `Tooltip`).
5.  **Key Files**:
    -   `/src/components/micro-apps/vin-diesel.tsx` (Main UI)
    -   `/src/ai/agents/vin-diesel.ts` (Agent logic with external API call)
    -   `/src/ai/agents/vin-diesel-cache.ts`
6.  **Dependencies**: BEEP `validateVin` tool, `billing-service`, external NHTSA API.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `VinDieselIcon`, `Progress` bar.
9.  **Status**: Active.
10. **Documentation**: `docs/Vin-Diesel.md`.
11. **Internal Notes**: "I live my life a quarter mile at a time." The external API call is live, but has mock fallbacks.
12. **Security**: Relies on a third-party API; the connection must be secure. No sensitive user data is sent.
13. **Warnings**: None.

---

### The Winston Wolfe
1.  **Name**: The Winston Wolfe
2.  **Purpose**: A reputation management tool that generates professional, disarming responses to negative online reviews.
3.  **Primary Functionality**: User pastes a negative review. The agent, embodying "The Fixer," generates a single, perfect response to de-escalate the situation.
4.  **Tech Stack**: React, TypeScript, ShadCN UI (`Card`, `Textarea`, `Button`, `Alert`).
5.  **Key Files**:
    -   `/src/components/micro-apps/winston-wolfe.tsx` (Main UI)
    -   `/src/ai/agents/winston-wolfe.ts` (Agent logic)
6.  **Dependencies**: BEEP `solveReputationProblem` tool, `billing-service`.
7.  **Registration**: `micro-app-registry.tsx`, `config/artifacts.ts`.
8.  **UI Components**: `WinstonWolfeIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Winston-Wolfe.md`.
11. **Internal Notes**: "I solve problems." The persona is key: calm, direct, and brutally efficient.
12. **Security**: Low risk. Processes user-provided text.
13. **Warnings**: None.

---

### Workspace Settings
1.  **Name**: Workspace Settings
2.  **Purpose**: A utility app for managing the settings of the current workspace.
3.  **Primary Functionality**: A simple form to update the workspace name.
4.  **Tech Stack**: React, TypeScript, `react-hook-form`, `zod`, ShadCN UI (`Form`, `Input`, `Button`).
5.  **Key Files**:
    -   `/src/components/micro-apps/workspace-settings.tsx` (Main UI)
    -   `/src/app/api/workspaces/me/route.ts` (API endpoint)
6.  **Dependencies**: `/api/workspaces/me` endpoint.
7.  **Registration**: `micro-app-registry.tsx`. Launched via BEEP command or a potential future settings icon.
8.  **UI Components**: `WorkspaceSettingsIcon`.
9.  **Status**: Active.
10. **Documentation**: `docs/Settings-Apps.md`.
11. **Internal Notes**: Like the User Profile app, data is pre-fetched and passed as props to improve performance.
12. **Security**: The API endpoint is secured by session middleware.
13. **Warnings**: None.

---

## Summary & Analysis

### Strengths
-   **Strong Thematic Cohesion**: The Micro-Apps consistently adhere to the "Agentic Mythware™" and "Ancient Roman Glass" doctrines. Personas are well-defined and integrated into both agent logic and UI components.
-   **Modular & Scalable Architecture**: The use of a central `micro-app-registry`, unified `config/artifacts.ts`, and a consistent agentic interaction pattern (BEEP -> Tool -> Agent -> Report) provides a robust and scalable foundation.
-   **Monetization Integration**: Billing is deeply integrated. Nearly every agentic action is correctly piped through the `billing-service`, and several apps feature clever, non-intrusive upsell hooks (monetization hooks).
-   **Psychological Engine Integration**: Several apps (Dr. Syntax, Folly Instruments) are already "psyche-aware," laying the groundwork for the deeper personalization described in the documentation.

### Weaknesses & Improvement Opportunities
-   **Mocked Data**: Several key apps (`Lahey Surveillance`, `Orphean Oracle`, `Scribe's Archive`, `Slack Tools`) rely on mocked data. Replacing these with live data sources is the most critical next step for full functionality.
-   **Client-Side State**: Some apps (`Patrickt™`, `Paper Trail P.I.`) use ephemeral, client-side state for their core data. While suitable for a prototype, this data should be persisted to the database to become a true feature of the OS.
-   **Redundant App Definitions**: There are several instances where app functionality is defined in multiple places (e.g., `config/artifacts.ts`, `micro-app-registry.tsx`, `app-store.ts`). Consolidating these into a single source of truth, likely `config/artifacts.ts`, would improve maintainability. The `MicroAppType` union in `app-store.ts` is a prime candidate for being auto-generated from the manifest.
-   **Agent vs. Server Action**: There's a slight architectural inconsistency between apps that use a full agentic flow (e.g., `Dr. Syntax`) and those that use a direct Server Action (`Paper Trail`). For clarity, all backend logic should ideally be exposed as an agentic tool that BEEP can call, with server actions reserved for simple, non-agentic mutations.

This analysis provides a clear path forward for hardening the system, replacing mocked components with live services, and continuing to build upon this strong, doctrinally-aligned foundation.
