# VIN Diesel: Turbocharged Compliance - Technical Specification

> "I live my life a quarter mile at a time. Nothing else matters. Not the mortgage, not the store, not my team and all their bullshit. For those ten seconds or less, I'm free."

---

## 1. System Overview

VIN Diesel is a **specialized compliance and data-decoding Micro-App**. It embodies the persona of Dominic Toretto from the *Fast & Furious* franchise to validate and decode Vehicle Identification Numbers (VINs) with speed and swagger.

It transforms the dry, administrative task of VIN validation into a high-octane, in-character experience.

---

## 2. Core Components & Implementation

### 2.1. The `vin-diesel-agent` (`agents/vin-diesel.ts`)
The agent's logic is powered by the `validateVin` flow.
- **Mocked API Logic**: For the prototype, the flow uses hardcoded logic to handle specific test VINs ('TESTVIN1234567890' for a valid case, 'BADVIN1234567890' for an invalid case) and to check for the correct 17-character length. This would be replaced by a call to an external VIN decoding API (e.g., NHTSA) in a production environment.
- **Persona-Driven Generation**: For generic valid VINs, the agent makes an LLM call with a prompt instructing it to generate a witty, confident, in-character confirmation message.
- **Input**: Accepts a 17-character `vin` string.
- **Output (`VinDieselOutputSchema`)**: Returns a structured JSON object with the validation status (`isValid`), an in-character `statusMessage`, decoded vehicle information (make, model, year), and a mock `complianceReport` (registration, customs, inspection).

### 2.2. The `VinDiesel` Micro-App (`micro-apps/vin-diesel.tsx`)
The UI is a sleek, automotive-themed dashboard for VIN validation.
- **Input**: A single `Input` field, styled for a "mono" font and limited to 17 characters, for the VIN.
- **Execution**: A "Hit the Gas" button triggers the `validateVin` tool via a BEEP command. The UI displays an animated `Progress` bar during processing to simulate a "nitro boost."
- **Result Display**: The results are displayed in a series of themed `Alert` and `Collapsible` components, showing the validation status, decoded info, and the full compliance report.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The VIN Diesel app can be launched from the Canvas or summoned via a BEEP command like, "Run the VIN on this '70 Charger."
- **Agentic Control**: BEEP uses the `validateVin` tool to pass the VIN string to the agent.
- **Billing**: Each VIN validation is a billable agent action, debited by Obelisk Pay.
- **Monetization Hook**: The UI includes a disabled "Fast Lane" switch. The tooltip explains that this premium feature (for priority processing and real-time monitoring) requires a plan upgrade, serving as an in-app upsell path.
- **The Armory**: VIN Diesel is listed as a featured, one-time purchase in The Armory.
