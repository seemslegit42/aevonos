
# The Pantheon: The Star-Chart of Souls - Technical Specification

> "Look upon your domain, Architect. Every soul is a star in your sky. Observe their light. Guide their path."

---

## 1. System Overview

The Pantheon is the **Architect's primary user management interface**. It is not a sterile list of users; it is a living, interactive representation of the community within the workspace. It provides the Architect with the tools to observe, manage, and nurture the souls under their command.

The Pantheon is the visual embodiment of the principle that a workspace is not just a collection of accounts, but a living society.

---

## 2. Core Components & Implementation

The Pantheon's power is manifested through the **Admin Console Micro-App**, a privileged, multi-faceted command center available only to the workspace Architect.

### 2.1. The Admin Console Micro-App (`micro-apps/admin-console.tsx`)
This is a tabbed interface that consolidates all high-level administrative functions.

-   **Overlook Tab**: Provides a high-level dashboard of key workspace metrics.
-   **Pantheon Tab**: This is the core of user management. It fetches and displays all users in the workspace as a constellation of interactive "User Stars." Selecting a star reveals a `UserCard` with detailed information and provides access to Architect's Decrees.
-   **Agent Muster Tab**: A monitoring view for all commissioned agents within the workspace, allowing the Architect to view their status and perform lifecycle actions.
-   **Sacred Vows Tab**: A gallery displaying the vows each user made during their Rite of Invocation, giving the Architect insight into their core motivations.
-   **Covenants Tab**: A strategic overview of the three Covenants (Motion, Worship, Silence), showing member lists and leaderboards for each, allowing the Architect to monitor the cultural alignment of their community.

### 2.2. Architectural Decrees (Server Actions)
All administrative actions (e.g., changing a user's role, exiling a user from the workspace) are handled by secure server actions in `src/app/admin/actions.ts`. These actions perform critical permission checks, ensuring that only the workspace `owner` can execute them.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Admin Console is summoned by the BEEP command, "BEEP, reveal the Pantheon," or by launching it from the Armory.
- **Sovereign Control**: Access to the Admin Console's management features is hard-coded to the `owner` of the workspace, reinforcing the ultimate authority of the Architect.
- **Architectural Role**: The Admin Console transforms workspace management from a mundane administrative task into a strategic act of governance, allowing the Architect to curate their community's structure, monitor its health, and understand its soul with precision and authority.
