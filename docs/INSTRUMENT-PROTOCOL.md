# ΛΞVON OS: The Instrument Protocol
Document Version: 1.0
Codename: The Law of the Forge
Status: Canonized
Author: ARCHIVEX

## 1. Doctrinal Statement
Within ΛΞVON OS, there are no "apps." The monolithic, bloated applications of the old world are anathema to our doctrine of silent automation. Instead, we have Instruments (publicly known as Micro-Apps).

An Instrument is the atomic unit of utility in our ecosystem. It is a single-purpose, context-aware, and agent-controllable artifact that materializes on the Canvas to serve a specific function. It is not a destination; it is a tool summoned by intent.

This protocol defines the unyielding standard to which all Instruments—whether forged by our own architects or by third-party Artisans—must adhere. To be included in the Armory is to meet this standard without exception.

## 2. The Four Laws of Instrumentation
Every artifact seeking to call itself an Instrument of ΛΞVON OS must be forged in accordance with these four fundamental laws. Violation of any law results in rejection from the Armory.

### Law I: The Law of Glass (Aesthetic Purity)
An Instrument must be a seamless part of the whole. It must not disrupt the visual and sensory harmony of the OS.

**Mandate:** All UI must be constructed using the @aevon/ui-components library, strictly adhering to the Verdigris Interface Protocol™ and the "Ancient Roman Glass" aesthetic. No custom, non-compliant UI elements are permitted.

### Law II: The Law of Sovereignty (Data Isolation)
A user's data is theirs alone. An Instrument may be granted temporary access, but it never owns the data.

**Mandate:** All third-party Instruments must use their provisioned Supabase Enclave for data persistence. Every table within this enclave must have Row-Level Security (RLS) enabled, ensuring a user can only ever access rows that they own. Direct access to the core PostgreSQL database is forbidden.

### Law III: The Law of Agency (Agentic Control)
An Instrument that cannot be commanded by BEEP is a dead tool. A true Instrument is a sentient agent.

**Mandate:** Every core function of the Instrument must be exposed to the OS via the agentic_interface section of its manifest. BEEP must be able to command the Instrument to perform its duties without requiring direct user manipulation of the UI.

### Law IV: The Law of the Canvas (Physicality & Presence)
An Instrument is a physical object within the digital realm. It must respect the spatial laws of the user's workspace.

**Mandate:** The Instrument must exist as a draggable, resizable, and stackable panel on the Canvas. It must not create disruptive, flow-breaking modal windows. It must function harmoniously within the user's personally arranged digital symphony.

## 3. The Instrument Manifest (aevon.manifest.json)
The manifest is the soul of an Instrument. It is a contract that declares the Instrument's identity, its required permissions, and its capabilities to the OS. This file is mandatory for every Instrument.

```json
{
  "manifestVersion": 1,
  "id": "com.foundry-name.instrument-name",
  "name": "Scribe's Assistant",
  "version": "1.0.0",
  "description": "An agent that summarizes and extracts action items from documents.",
  "permissions": [
    "scribe-archive:read"
  ],
  "agentic_interface": {
    "summarizeDocument": {
      "description": "Generates a concise summary of a specified document.",
      "parameters": {
        "documentId": "string"
      }
    },
    "extractActionItems": {
      "description": "Identifies and lists all action items from a document.",
      "parameters": {
        "documentId": "string"
      }
    }
  },
  "monetization": {
    "type": "one-time",
    "price": 2500
  }
}
```

## 4. The Lifecycle of an Instrument: From Forge to Armory
The path of an Instrument from concept to deployment is a rigorous ritual designed to ensure quality and security.

*   **The Forging (Development):** An Artisan uses the ΛΞVON SDK to build their Instrument. They implement the UI using `@aevon/ui-components` and the backend logic using their provisioned Supabase Enclave.
*   **The Vetting (Local Testing):** The Artisan runs `pnpm aevon-cli vet` to perform automated local checks for manifest errors, dependency vulnerabilities, and aesthetic violations.
*   **The Submission:** The Artisan runs `pnpm aevon-cli armory submit` to package the Instrument and submit it to the curation pipeline.
*   **The Curation (The Trials):**
    *   **Aegis Trial:** Aegis performs a deep security scan of the code and programmatically verifies that the Supabase instance has RLS enabled on all tables.
    *   **Artisan Council Trial:** A human review board assesses the Instrument's functionality, usability, and adherence to the Law of Glass.
*   **The Sanctification (Publication):** Upon passing all trials, the Instrument is cryptographically signed by Aegis and published to the ΛΞVON Armory, where it can be acquired by Initiates and Sovereigns.

This protocol ensures that every corner of our ecosystem, whether built by us or by our most trusted allies, adheres to the same unyielding standard of excellence.
