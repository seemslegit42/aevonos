# BEEP: Swarm Routing & Delegation Spec

### I. Overview: BEEP as the Orchestrator and Conductor

Once BEEP has parsed a user's command and understood their intent, its primary responsibility shifts from interpretation to execution. This involves identifying the most appropriate "Agents" or "Agent Kits" from the Armory, orchestrating their activation, managing their execution, and ensuring the seamless flow of data between them and external systems. BEEP acts as the central conductor, directing a distributed "swarm" of specialized AI agents.

### II. Agent Identification & Selection: The Armory Nexus

BEEP intelligently queries the ΛΞVON Armory to find the optimal agent(s) or workflows to fulfill the parsed user intent.

1.  **Intent-to-Agent Mapping:**
    * **Primary Mapping:** A core registry within the Armory explicitly links predefined Intents to specific Agent Kits or foundational Agents.
    * **Contextual Prioritization:** BEEP refines this mapping based on the user's "Vow", active Micro-App context, and historical usage.

2.  **Capability Matching (Dynamic Tool Use):**
    * For novel or complex requests, BEEP leverages its underlying LLM and the Agent Registry to find agents possessing the necessary "tools" (e.g., API integrations).
    * BEEP constructs a "plan" (a dynamic workflow) in Loom Studio on the fly, assembling multiple agents if needed.

3.  **Third-Party Agent Inclusion:**
    * BEEP's selection algorithm gives preference to first-party agents but can dynamically include certified third-party agents from the Armory.

### III. Delegation & Execution: The Swarm in Motion

Once the agent(s) are identified, BEEP initiates execution via a distributed swarm model.

1.  **Workflow Instantiation (LangGraph Integration):**
    * BEEP instantiates a LangGraph workflow for the task, where each node represents an Agent Action. For multi-agent plans, BEEP's reasoning engine generates a bespoke LangGraph instance.

2.  **Parameter Passing & Context Handover:**
    * BEEP passes extracted slot values and relevant context from its memory to the invoked agents through secure, ephemeral data pipes.

3.  **Asynchronous & Parallel Execution:**
    * Where possible (e.g., creating a CRM entry and an invoice simultaneously), BEEP triggers parallel execution of agent actions to maximize efficiency.

4.  **Resource Allocation (KLEPSYDRA Integration):**
    * BEEP interfaces with the KLEPSYDRA Engine to request and manage computational resources, ensuring accurate tribute (ΞCredit) consumption.

5.  **Execution Monitoring & Progress Reporting:**
    * BEEP constantly monitors active agents and provides real-time, persona-appropriate updates to the user. Upon completion, BEEP provides a concise summary of the outcome.

### IV. Delegation Patterns: Orchestrating Complexity

BEEP employs various delegation patterns to handle requests:

1.  **Direct Agent Invocation:** For simple, atomic intents, BEEP invokes a single specialized agent.
2.  **Sequential Workflow Delegation:** For multi-step processes, BEEP orchestrates a pipeline of agents using pre-built LangGraph templates.
3.  **Parallel Execution & Aggregation:** For concurrent tasks, BEEP dispatches agents in parallel and aggregates their results.
4.  **Sub-Delegation (Agent-to-Agent Communication):** Advanced agents can sub-delegate tasks to other specialized agents, creating a hierarchical swarm.
5.  **Human-in-the-Loop (HITL) Integration:** For tasks requiring human judgment, BEEP delegates to a "Human Intervention Agent" that pauses the workflow and awaits user input.
