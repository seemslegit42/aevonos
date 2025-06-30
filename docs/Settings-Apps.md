# Settings Apps: User & Workspace - Technical Specification

> "The machine must know its master. The master must know their machine."

---

## 1. System Overview

The Settings Apps are a pair of **core utility Micro-Apps** (`User Profile` and `Workspace Settings`) that provide a simple, focused interface for managing essential user and workspace configurations.

They are designed to be lightweight, secure, and directly interactive with the backend API, ensuring that user-initiated changes are handled cleanly and efficiently.

---

## 2. Core Components & Implementation

### 2.1. `User Profile Settings` Micro-App (`micro-apps/user-profile-settings.tsx`)
- **Purpose**: Allows the authenticated user to manage their own profile information.
- **UI**: A simple form with fields for `firstName` and `lastName`.
- **Backend Interaction**:
  - **On Mount**: The app is launched with the current `user` object passed as a prop from the `TopBar`, eliminating the need for an initial data fetch.
  - **On Submit**: The form calls the `PUT /api/users/me` endpoint to update the user's data in the database.
- **Additional Actions**: Includes buttons for `Logout` and `Delete Account`, which trigger the corresponding server actions in `src/app/auth/actions.ts`.

### 2.2. `Workspace Settings` Micro-App (`micro-apps/workspace-settings.tsx`)
- **Purpose**: Allows the authenticated user to manage the settings for their current workspace.
- **UI**: A simple form with a field for the workspace `name`.
- **Backend Interaction**:
  - **On Mount**: The app is launched with the current `workspace` object passed as a prop from the `TopBar`.
  - **On Submit**: The form calls the `PUT /api/workspaces/me` endpoint to update the workspace's data.

### 2.3. The `TopBar` Component (`components/layout/top-bar.tsx`)
- **Invocation Logic**: The `TopBar` is the primary entry point for launching the settings apps. It contains `onClick` handlers that call the `upsertApp` function from the `app-store`, passing the correct app type and the already-fetched `user` and `workspace` data as `contentProps`. This makes the apps fast and efficient, as they don't need to re-fetch data that is already available in the main layout.

---

## 3. Integration with ΛΞVON OS

- **Architectural Pattern**: These apps exemplify a key UX pattern in ΛΞVON OS: using the main layout components (like the `TopBar`) to pre-fetch and pass data to Micro-Apps, reducing redundant API calls and improving perceived performance.
- **Security**: All API endpoints (`/api/users/me`, `/api/workspaces/me`) are protected by the main `middleware.ts`, which validates the user's JWT session, ensuring that users can only modify their own data.
- **Invocation**: The primary way to access these apps is by clicking on the user/workspace name in the `TopBar`, although they can also be summoned by BEEP.
