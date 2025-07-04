
# VIN Diesel: The Compliance Accelerator - Technical Specification

> "I live my life a quarter-mile at a time. Nothing else matters. Not the mortgage, not the store, not my team and all their bullshit. For those ten seconds or less, I'm free."

---

## 1. System Overview

VIN Diesel is a **specialized compliance utility Micro-App** for the automotive import/export industry. It validates a Vehicle Identification Number (VIN) against the live NHTSA database with speed and swagger, providing instant feedback on the vehicle's identity and mock compliance status.

Its personality is inspired by Dominic Toretto—all about fast, decisive action and family (i.e., your company).

---

## 2. Core Components & Implementation

### 2.1. The `vin-diesel-agent` (`agents/vin-diesel.ts`)
The agent's logic is built into the `validateVin` flow, which demonstrates resilient external API calls.
- **Input**: Accepts a 17-character `vin` string.
- **Data Fetching**: The agent makes a live API call to the NHTSA database to decode the VIN and retrieve vehicle details (make, model, year). It includes error handling for invalid VINs or API failures.
- **Processing**: If the VIN is valid, a secondary LLM call generates a witty, in-character `statusMessage` and a mock `complianceReport` with plausible statuses for registration, customs, and inspection.
- **Output (`VinDieselOutputSchema`)**: Returns a structured JSON object containing the validation status, decoded info, and the full report.

### 2.2. The `VinDiesel` Micro-App (`micro-apps/vin-diesel.tsx`)
The UI is a sleek, automotive-themed dashboard for VIN validation.
- **VIN Input**: A stylized `Input` field specifically for the 17-character VIN.
- **Execution**: A "Hit the Gas" button triggers the `validateVin` tool via a BEEP command.
- **Report Display**: The UI shows a loading "Nitro Boost" progress bar during the request, then displays the validation result, decoded vehicle info, and a collapsible section for the detailed compliance report.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "VIN Diesel, run this VIN: [...]".
- **Tool Use**: Demonstrates real-world external API integration for data validation.
- **Billing**: Each validation is a billable agent action, consuming credits for both the `EXTERNAL_API` call and the `SIMPLE_LLM` call, debited by Obelisk Pay.
- **The Armory**: As a high-value utility for automotive businesses, VIN Diesel is listed in The Armory for a one-time purchase.
