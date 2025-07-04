# The Pantheon: The Admin Console - Technical Specification

> "From this vantage, the Architect may gaze upon all souls and systems within their domain."

---

## 1. System Overview

The Pantheon is a **privileged, core utility Micro-App** that serves as the central administrative console for the workspace Architect. It is the command center for user management, system monitoring, and agent oversight.

Access to this Micro-App is strictly limited to the user designated as the workspace `OWNER`, ensuring that only the Architect can wield its power.

---

## 2. Core Components & Implementation

### 2.1. The `admin-console.tsx` Component
The UI is a multi-tabbed interface designed to provide a comprehensive overview and control of the workspace.
- **Overlook Tab**: Displays high-level dashboard of key metrics (user count, active agents, credit balance, etc.).
- **Pantheon Tab**: A 3D, interactive visualization of all users in the workspace, rendered as a "star-chart." Clicking a star reveals a `UserCard` with details and management options.
- **Agent Muster Tab**: A table-based view of all commissioned agents, showing their status, type, and providing controls to pause, activate, or decommission them.
- **Sacred Vows Tab**: A gallery view that displays the `foundingVow` and `foundingGoal` of every user, offering insight into the collective purpose of the workspace.
- **Covenants Tab**: A dashboard visualizing the membership and Vow Alignment Score (VAS) leaderboards for each of the three Covenants.

### 2.2. Backend APIs
The console is powered by a suite of admin-only API endpoints:
- `GET /api/admin/overview`: Fetches dashboard stats.
- `GET /api/admin/users`: Fetches the list of all users in the workspace.
- `GET /api/agents`: Fetches the list of all agents.
- `GET /api/admin/vows`: Fetches the founding vows for all users.
- `GET /api/covenants/{name}/...`: Fetches data for the Covenants tab.

### 2.3. Server Actions
All administrative *write* operations (changing a user's role, deleting an agent) are handled by secure server actions defined in `app/admin/actions.ts`, which perform strict ownership and permission checks before interacting with the database.

---

## 3. Integration with ΛΞVON OS

- **Architect-Only Access**: The app is only launchable and visible in The Armory for the user designated as the workspace owner, enforcing the highest level of security.
- **Architectural Role**: It is the "god-view" for the OS, providing the Architect with the necessary tools to manage their digital nation, maintain order, and understand the health of their