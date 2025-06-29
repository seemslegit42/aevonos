# ΛΞVON OS: Frontend - Canvas UX Laws

## 1. The Canvas: The Sacred Stage of ΛΞVON OS

The Canvas is the persistent, living core of the ΛΞVON OS user interface. It is not a tabbed interface, a dashboard, or a traditional web page. It is the **"sacred stage"** where all work unfolds, orchestrating context-aware Micro-Apps and always reflecting the current thread of work.

### 1.1. Nature of the Canvas

*   **A Live Workspace**: The Canvas is a dynamic, interactive environment where users engage directly with their data and automated processes.
*   **Hosting Context-Aware Micro-Apps**: All core functionality is delivered through Micro-Apps that dynamically populate and interact within the Canvas.
*   **Orchestrated by BEEP**: BEEP, the agentic brain, plays the central role in managing, suggesting, and responding to activity within the Canvas, guiding the user's experience.
*   **Reflecting the Current Thread of Work**: The content and arrangement of Micro-Apps on the Canvas should intuitively guide the user through their ongoing tasks and automated workflows, minimizing distraction and cognitive load.

## 2. Canvas UX Laws: The Absolute Non-Negotiables

These laws define the unique interaction model of ΛΞVON OS and MUST be adhered to by all frontend development.

### Law 1: No Global Navbars. Context Defines View.
**Principle**: Unlike traditional applications with persistent left or top global navigation menus, ΛΞVON OS relies solely on context and BEEP's intelligence to guide the user. On desktop, there are no global navigation elements beyond the single persistent TopBar.
**Implication**: The appearance of Micro-Apps, their content, and BEEP's suggestions will implicitly guide the user through different functional areas based on their current task or query. Navigation is conversational and contextual, not menu-driven.
**Mobile Caveat**: The mobile experience, as per the Prime Directive, is a native-first reimagination. It employs a dedicated, persistent `BottomNavBar` for core actions, acknowledging the ergonomic constraints of the small screen.

### Law 2: Only One Persistent TopBar.
**Principle**: The TopBar is the only truly permanent global interface element in ΛΞVON OS. It is fixed at the top and never disappears or scrolls.
**Implication**: All other UI elements within the Canvas (Micro-Apps, notifications, temporary panels) are designed to be dynamic and flexible, ensuring they do not compete with the TopBar's global constancy.

### Law 3: Micro-Apps are Draggable, Resizable, and Stackable.
**Principle**: Micro-Apps within the Canvas must behave like flexible desktop windows, allowing users full control over their spatial arrangement.
**Implication**: Developers must implement robust drag-and-drop functionality, resizing handles, and stacking/layering capabilities (z-index management) for every Micro-App. This enables spatial memory and user customization of their workspace.

### Law 4: No Modal Chaos. Use Spatial Memory.
**Principle**: Avoid the proliferation of disruptive modal windows that break user flow and hide underlying context.
**Implication**: For secondary interactions or detail views (e.g., editing a contact, viewing usage details), prioritize opening new Micro-App instances or expanding existing ones. The system should rely on the spatial arrangement of Micro-Apps to maintain workflow context, rather than hiding it behind overlapping modals.

### Law 5: Agent Outputs and User Tasks Coexist, Not Compete.
**Principle**: The Canvas must seamlessly integrate output from AI agents and user-assigned tasks without overwhelming the user.
**Implication**: Agent responses, workflow progress updates, and task lists are presented within dedicated Micro-Apps or subtly integrated elements that are easily digestible and do not clutter the primary workspace, aligning with the "digital Zen garden" philosophy.

## 3. Design Directives: Orchestrating a Digital Symphony

When designing and implementing the Canvas and its interactions, remember the core directive: **Design like the user is conducting a digital symphony—not browsing a file system.**

*   **Fluidity**: Interactions should feel natural, responsive, and seamless, reflecting the "flow" concept.
*   **Intentionality**: Every element's placement and behavior should be purposeful, contributing to clarity and reducing cognitive load.
*   **Orchestration**: The interplay between BEEP, Loom Studio, and Micro-Apps should feel like a harmonious, intelligent system working in concert.
*   **Visual Harmony**: All elements must strictly adhere to the "Ancient Roman Glass" aesthetic, with consistent Glassmorphism, color palette, and typography, creating a beautiful and trustworthy environment.
