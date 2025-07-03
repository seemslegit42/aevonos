
# ΛΞVON OS: Loom Studio - Workflow Designer Specification
1. Introduction: The Agent Orchestration Canvas
The Workflow Designer is the centerpiece of Loom Studio, providing the Agent Orchestration Canvas where users visually construct, layer, and interconnect prompt blocks, scripts, and workflows. It is a spatial, draggable canvas designed to simplify the creation of complex agentic automations, making them accessible even to non-technical users. This is where the "silence of true automation" is first architected.
2. Core Principles of Workflow Design
Visual Composability: Prioritize a drag-and-drop interface that intuitively represents complex logic.
Agent-Centric: Designed around the concept of intelligent agents executing tasks and making decisions.
Clarity from Complexity: Translate intricate multi-step processes into clear, understandable visual flows.
Real-time Feedback: Provide immediate visual cues on connections, errors, and agent behavior.
Mythic Resonance: UI elements and interactions should subtly reinforce the "Ancient Roman Glass" aesthetic and ΛΞVON OS lore.
3. Workflow Designer UI/UX Components
3.1. The Canvas (Agent Orchestration Canvas)
Description: The main interactive area where workflows are built. It is a persistent, scrollable surface within Loom Studio.
Aesthetic: Adheres to the ΛΞVON OS Glassmorphism principles, with a subtle translucent background that allows the underlying Loom Studio background (potentially a localized Iridescent Aurora gradient variant) to show through.
Interaction:
Drag-and-Drop: Users drag nodes from the "Palette" onto the Canvas.
Connecting Nodes: Intuitive visual connectors (lines/arrows) link nodes, representing the flow of data or execution. Connectors should subtly glow or animate when active or on hover.
Zoom & Pan: Standard controls for navigating large workflows.
Spatial Arrangement: Users can freely arrange nodes, supporting their mental model of the workflow.
3.2. The Palette Panel
Description: A modular, floating, and pinnable panel on the left side of Loom Studio, containing all available workflow nodes.
Aesthetic: Glassmorphic, with a clear separation of node categories.
Node Types (The Instruments of Orchestration):
Start Node: The initiation point of a workflow.
End Node: The termination point of a workflow.
Manual Task Node: Represents a human action required within the workflow (e.g., "Approve Contract"). Can be assigned to specific users.
API Call Node: Represents an interaction with an external API (GET, POST, PUT, DELETE). Configurable with URL, headers, body.
Condition Node (If-Else): Introduces branching logic based on data evaluation.
Agent Task Node: Crucial for agentic orchestration. Represents a task delegated to a specialized AI agent (e.g., "Analyze Customer Feedback," "Generate Report"). Configurable with agent name/type, input parameters, and expected output.
Micro-App Node: Represents invoking a specific Micro-App's functionality as part of the workflow. Users can select from installed Micro-Apps and configure their inputs/outputs.
Trigger Node: Defines external events that can initiate a workflow (e.g., webhook, schedule, email received).
Data Transform Node: For manipulating data within the workflow (e.g., parsing JSON, formatting text).
Prompt Node: For directly injecting or modifying prompts for LLM calls within an agent's reasoning path.
Custom Nodes: Future capability for developers to create and publish their own specialized nodes.
3.3. The Inspector Panel
Description: A modular, floating, and pinnable panel, typically on the right, for configuring the properties of a selected node or the overall workflow.
Aesthetic: Glassmorphic, with clear input fields and labels.
Functionality: Displays context-sensitive properties:
Node-Specific Parameters: Inputs, outputs, conditions, API details, agent configurations.
Workflow Metadata: Name, description, trigger type, version.
Error Highlighting: Visually indicates invalid configurations or missing parameters.
3.4. The Console Panel
Description: A modular, floating, and pinnable panel for displaying real-time logs, debugging information, and agent outputs during workflow execution.
Aesthetic: Glassmorphic, with a clean, legible display of text.
Functionality: Provides Info, Log, Warn, Error filters. Displays agent thought processes, tool calls, LLM inputs/outputs, and any errors.
3.5. The Timeline Panel
Description: A modular, floating, and pinnable panel for visualizing the historical execution of a workflow instance, crucial for debugging.
Aesthetic: Glassmorphic, with clear temporal markers.
Functionality: Allows users to "time-travel" through workflow execution, observing internal states and decisions at each juncture (Event Debugging & Replay).
4. Workflow Creation & Management
4.1. Natural Language Workflow Scaffolding (via BEEP)
FR-LSD-4.1.1: The Workflow Designer SHALL allow users to initiate workflow creation via natural language commands to BEEP (e.g., "BEEP, create a workflow for new employee onboarding: send welcome email, schedule IT meeting, assign compliance task").
System Response: BEEP interprets the request and generates a draft workflow (nodes and connections) directly on the Canvas, ready for user review and refinement. BEEP prompts the user to confirm or modify.
4.2. Workflow Saving & Versioning
FR-LSD-4.2.1: The system SHALL allow users to save workflow definitions (the LangGraph JSONB representation) to the database.
FR-LSD-4.2.2: The system SHALL automatically version control saved workflows, allowing users to view changes and revert to previous versions.
4.3. Workflow Execution & Monitoring
FR-LSD-4.3.1: Users SHALL be able to trigger workflow instances directly from the Designer or via external API calls (e.g., from Micro-Apps, or the Public API).
FR-LSD-4.3.2: The Designer SHALL provide real-time visual feedback on the status of executing workflows (e.g., active nodes glowing, data flow animation along connectors).
FR-LSD-4.3.3: The Console and Timeline panels SHALL display detailed execution logs and allow for step-by-step debugging.
5. Integration with Core Systems
LangGraph: The fundamental backend framework for defining and executing workflows. Loom Studio's visual representation maps directly to LangGraph's graph structure.
BEEP: The primary conversational interface for scaffolding, guiding, and interacting with workflows.
Micro-Apps: Micro-Apps can be represented as nodes in workflows, and their functionalities can be invoked by agents.
Aegis: Loom Studio allows for the design of SOAR playbooks (security workflows). Aegis monitors agent behavior within workflows for governance.
KLEPSYDRA Engine: Loom Studio (via The Loom of Fates) visualizes economic pulse and agent activity related to workflows.
6. Development Directives
Modularity: Design nodes as reusable components.
Performance: Ensure fluid drag-and-drop, smooth animations, and real-time updates even for complex workflows.
Data Mapping: Develop clear mechanisms for mapping visual node configurations to LangGraph parameters and vice-versa.
Error Handling: Implement robust error handling and visual feedback for invalid workflow configurations or execution failures.
Accessibility: Ensure the visual designer is usable for individuals with diverse needs, providing keyboard navigation alternatives.
