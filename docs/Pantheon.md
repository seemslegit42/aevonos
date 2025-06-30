
# The Pantheon: The Star-Chart of Souls - Technical Specification

> "Look upon your domain, Architect. Every soul is a star in your sky. Observe their light. Guide their path."

---

## 1. System Overview

The Pantheon is the **Architect's primary user management interface**. It is not a sterile list of users; it is a living, interactive representation of the community within the workspace. It provides the Architect with the tools to observe, manage, and nurture the souls under their command.

The Pantheon is the visual embodiment of the principle that a workspace is not just a collection of accounts, but a living society.

---

## 2. Core Components & Implementation

### 2.1. The `AdminConsole` Micro-App (`micro-apps/admin-console.tsx`)
The Pantheon is not a standalone app but the central, default tab within the `AdminConsole` Micro-App.

### 2.2. The `UserManagementTab` Component (`micro-apps/admin-console/UserManagementTab.tsx`)
- **Soul Mapping**: The tab fetches and displays all users in the workspace as a grid of `UserCard` components.
- **`UserCard` Component**: Each card is a rich summary of a user's identity within the OS, displaying their name, email, role, chosen psyche, and agent alias.
- **Architectural Decrees**: The card contains a dropdown menu of privileged actions available only to the Architect:
  - **Bestow Rank**: Allows the Architect to change a user's `role` (e.g., from `OPERATOR` to `MANAGER`).
  - **Exile Soul**: Allows the Architect to remove a user from the workspace entirely.

### 2.3. Server Actions (`app/admin/actions.ts`)
- All administrative actions are handled by secure server actions (`updateUserRole`, `removeUserFromWorkspace`).
- These actions perform critical permission checks, ensuring that only the workspace `owner` (the Architect) can execute them and that the Architect cannot accidentally demote or remove themselves.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Pantheon is summoned by the BEEP command, "BEEP, reveal the Pantheon," which launches the `AdminConsole` Micro-App.
- **Sovereign Control**: Access to the Pantheon's management features is hard-coded to the `owner` of the workspace, reinforcing the ultimate authority of the Architect.
- **Architectural Role**: The Pantheon transforms user management from a mundane administrative task into a strategic act of governance, allowing the Architect to curate their community's structure and capabilities with precision and authority.
