# CRM Suite: Contact Management - Technical Specification

> "A name is a key. A contact is a door. This is your floor plan."

---

## 1. System Overview

The CRM Suite is a **foundational utility** within ΛΞVON OS, providing core contact management functionalities through a collection of tightly integrated Micro-Apps and agentic tools. It is designed to be a simple, robust, and agent-first system of record for a user's professional network.

Unlike bloated, traditional CRMs, the ΛΞVON OS implementation prioritizes speed, clarity, and control via the BEEP command interface.

---

## 2. Core Components & Implementation

### 2.1. Agentic Tools (`ai/tools/crm-tools.ts`)
The heart of the CRM is a set of multi-tenant, usage-tracked Genkit flows that perform atomic database operations. These are the primary interface for BEEP.
- **`createContactInDb`**: Adds a new contact record.
- **`listContactsFromDb`**: Retrieves all contacts for the current workspace.
- **`updateContactInDb`**: Modifies an existing contact record.
- **`deleteContactInDb`**: Removes a contact record.

Each tool is wrapped in a flow that first authorizes and debits the action against the workspace's credit balance via the `billing-service`.

### 2.2. `Contact List` Micro-App (`micro-apps/contact-list.tsx`)
This app serves as the primary visual interface for browsing contacts.
- **Fetches Data**: On mount, it calls the `/api/contacts` endpoint to get the list of contacts.
- **Displays Contacts**: Renders contacts in a `ContactCard` format.
- **Initiates Actions**: Contains buttons to "Add Contact" (which opens the `Contact Editor` app) and to edit/delete individual contacts.

### 2.3. `Contact Editor` Micro-App (`micro-apps/contact-editor.tsx`)
A dedicated UI for creating or editing a single contact record.
- **Smart Form**: The form adapts for either creating a new contact or updating an existing one (pre-filled with the contact's data).
- **Command Generation**: On submit, the form does not call an API directly. Instead, it **constructs a natural language command string** (e.g., `update contact with id 123 set email to "new@email.com"`) and passes it to the central `handleCommandSubmit` function in the app store. This ensures that even UI-initiated actions are processed through the BEEP agent, maintaining a single, auditable path for all mutations.
- **Reactive Closure**: The app is designed to be closed automatically by the app store upon receiving a successful agent report for a `create` or `update` action, providing a seamless UX.

---

## 3. Integration with ΛΞVON OS

- **BEEP-First Interaction**: The primary way to interact with the CRM is through BEEP (e.g., "create a contact for Jane Doe," "show me all my contacts"). The Micro-Apps serve as visual fallbacks or for more complex data entry.
- **Data Scoping**: All database queries and API calls are strictly scoped to the `workspaceId` from the user's authenticated session, ensuring data isolation.
- **Billing**: Every CRM action (create, update, list, delete) is a billable agent action, debited by Obelisk Pay. This provides a granular, value-based pricing model.
