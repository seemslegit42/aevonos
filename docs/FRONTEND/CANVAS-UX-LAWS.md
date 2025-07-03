
# ΛΞVON OS: Frontend - Canvas UX Laws

## 1. The Canvas: The Sacred Stage of ΛΞVON OS

The Canvas is the persistent, living core of the ΛΞVON OS user interface. It is not a tabbed interface, a dashboard, or a traditional web page. It is the **"sacred stage"** where all work unfolds, orchestrating context-aware Micro-Apps and always reflecting the current thread of work.

### 1.1. Nature of the Canvas

*   **A Live Workspace**: The Canvas is a dynamic, interactive environment where users engage directly with their data and automated processes. Its background is the living **Iridescent Aurora**, a dynamic gradient that reflects the system's state.
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
**Implication**: All other UI elements within the Canvas (Micro-Apps, notifications, temporary panels) are designed to be dynamic and flexible, ensuring they do not compete with the TopBar's global constancy. **The TopBar will contain NO ICONS whatsoever**. It will feature the ΛΞVON OS logo image, the central BEEP command input, and text-only status/session information.

### Law 3: Micro-Apps are Draggable, Resizable, and Stackable.
**Principle**: Micro-Apps within the Canvas must behave like flexible desktop windows, allowing users full control over their spatial arrangement.
**Implication**: Developers must implement robust drag-and-drop functionality, resizing handles, and stacking/layering capabilities (z-index management) for every Micro-App. This enables spatial memory and user customization of their workspace.

### Law 4: No Modal Chaos. Use Spatial Memory.
**Principle**: Avoid the proliferation of disruptive modal windows that break user flow and hide underlying context.
**Implication**: For secondary interactions or detail views (e.g., editing a contact, viewing usage details), prioritize opening new Micro-App instances or expanding existing ones. The system should rely on the spatial arrangement of Micro-Apps to maintain workflow context, rather than hiding it behind overlapping modals.

### Law 5: Agent Outputs and User Tasks Coexist, Not Compete.
**Principle**: The Canvas must seamlessly integrate output from AI agents and user-assigned tasks without overwhelming the user.
**Implication**: Agent responses, workflow progress updates, and task lists are presented within dedicated Micro-Apps or subtly integrated elements that are easily digestible and do not clutter the primary workspace, aligning with the "digital Zen garden" philosophy.

### Law 6: The Obelisk of Genesis is Permanent.
**Principle**: The central Obelisk, representing the collective effort and legacy of the workspace, is a permanent, non-closable fixture on the Canvas.
**Implication**: All other Micro-Apps and UI elements must respect the Obelisk's central position. It serves as the visual and spiritual anchor of the entire OS.

## 3. The "Ancient Roman Glass" Aesthetic Directive

All floating UI elements (Cards, Popovers, Dialogs, Menus) MUST adhere to a unified glassmorphism style to maintain visual harmony and a sense of tangible, layered reality. This is not optional.

### 3.1. Canonical Styling
The standard implementation for any glassmorphic surface in ΛΞVON OS is a precise combination of background color, blur, border, and shadow. The canonical Tailwind CSS classes for this effect are:

`bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg`

-   **`bg-background/70`**: A semi-transparent background using the current theme's `--background` color. This ensures adaptability across all Covenant themes.
-   **`backdrop-blur-xl`**: A significant blur effect on the content behind the element, creating the frosted glass look.
-   **`border border-border/20`**: A very subtle, semi-transparent border using the theme's `--border` color, which gives the glass a defined edge.
-   **`shadow-lg`**: A soft shadow to lift the element off the Canvas, enhancing the sense of depth and layer.

### 3.2. Implementation
This styling MUST be implemented in the base UI components (`ui/card.tsx`, `ui/dialog.tsx`, `ui/popover.tsx`, etc.). All other components, such as `MicroAppCard`, MUST inherit this styling by using the base components, not by reimplementing the style with hardcoded values. This ensures a consistent, maintainable, and doctrinally-aligned visual language across the entire OS.
