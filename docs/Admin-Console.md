# The Admin Console: System Primus - Technical Specification

> "The first duty of a ruler is to know their own domain."

---

## 1. System Overview

The Admin Console is a **privileged core utility Micro-App** designed for users with the `ADMIN` role. It provides a centralized, high-level interface for workspace management, user administration, and monitoring the health of deployed AI agents.

This is the command center, not a user-facing dashboard. Its purpose is control, oversight, and the enforcement of order within the workspace.

---

## 2. Core Components & Implementation

### 2.1. The `AdminConsole` Micro-App (`micro-apps/admin-console.tsx`)
The UI is a clean, tab-based interface designed for administrative efficiency.
- **Dashboard Tab**: Displays at-a-glance metrics for the workspace, including user count, agent status, and the current ΞCredit balance. It fetches data from `/api/admin/overview`.
- **User Management Tab**: Provides a list of all users within the workspace. Administrators can modify user roles (e.g., promoting an `OPERATOR` to a `MANAGER`) or remove users from the workspace. All mutation actions are handled by secure server actions.
- **System Monitoring Tab**: Lists all deployed AI agents, showing their current status (`active`, `idle`, `error`). Administrators can pause, resume, or decommission agents directly from this view. All mutation actions are handled by secure server actions.

### 2.2. Backend APIs & Server Actions
- **API Endpoints**: Secure API routes (`/api/admin/*`) provide the data for each tab. Access is strictly limited to users with an `ADMIN` role, enforced by the `middleware.ts`.
- **Server Actions (`app/admin/actions.ts`)**: All administrative actions (updating roles, changing agent status) are implemented as secure, server-side actions that perform their own permission checks, ensuring that even if the UI were compromised, unauthorized mutations would be impossible.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Admin Console can be launched from the Canvas or The Armory. It is only visible and accessible to users with the `ADMIN` role.
- **Architectural Role**: It serves as the primary control panel for the "Polis" (the workspace). It empowers the workspace owner to manage their sovereign digital environment, reinforcing the principle of user-led governance.
- **Security**: Access is tightly controlled at multiple layers: the app is hidden in the UI for non-admins, and all backend operations are protected by role-based access control (RBAC).
