
# ΛΞVON OS: Operations - Testing Guidelines
1. Introduction: Engineering for Precision and Silence
Testing is a fundamental practice in ΛΞVON OS development, not an afterthought. It ensures every "sacred instrument" (Micro-App, agent, workflow) performs flawlessly and securely. Our testing philosophy supports rapid iteration while maintaining the highest quality standards, minimizing defects, and enhancing trust in the system's autonomous operations.
2. Core Testing Principles
Shift Left: Integrate testing early in the development lifecycle to catch bugs and security vulnerabilities as soon as possible.
Automation: Prioritize automated tests to enable rapid feedback and consistent validation across all environments.
Comprehensive Coverage: Strive for high test coverage across different layers of the application (unit, integration, E2E).
Security-First: Embed security testing into every stage, reinforcing the Aegis "build like he's watching" directive.
Performance Awareness: Ensure that new features and changes do not introduce performance regressions.
Reproducibility: Tests should be deterministic and produce consistent results.
Clear Reporting: Test results should be easily accessible and understandable.
3. Testing Types & Frameworks
ΛΞVON OS employs a multi-layered testing strategy:
3.1. Unit Tests
Purpose: To verify the smallest testable parts of the application (functions, components, modules) in isolation.
Scope: Individual functions, pure components, utility helpers, business logic.
Frameworks:
TypeScript/React: Vitest.
Python (LangGraph/FastAPI): Pytest.
Integration Points: Run during every commit and Pull Request (PR) in the CI pipeline.
3.2. Integration Tests
Purpose: To verify the interactions between different units or services (e.g., API endpoint to database, service-to-service communication).
Scope: API Routes, microservice endpoints, database ORM interactions (Prisma), Pub/Sub message processing, external API calls (mocked or sandboxed).
Frameworks:
TypeScript/React: Vitest (for API Routes/Edge Functions interactions).
Python (LangGraph/FastAPI): Pytest (for FastAPI service interactions and LangGraph node connections).
Integration Points: Run during every commit and PR in the CI pipeline.
3.3. End-to-End (E2E) Tests
Purpose: To simulate real user scenarios and verify entire application flows from start to finish, interacting with the UI as a user would.
Scope: Core user journeys (e.g., user login, BEEP command execution, Micro-App launch, workflow creation, security alert processing, Folly Instrument play, Obelisk Pay transactions).
Framework: Playwright.
Integration Points: Run against staging environments during Continuous Delivery, and as a final gate for production deployments.
3.4. AI-Specific Testing
Given ΛΞVON OS's agentic core, specialized AI testing is critical.
Agent Behavioral Testing:
Purpose: To validate that AI agents (orchestrated by BEEP via LangGraph/CrewAI) reliably achieve their goals, reason correctly, and adapt as expected.
Scope: LangGraph graph execution paths, agent tool usage, decision-making logic, memory retrieval.
Tools/Techniques: Loom Studio's Event Debugging & Replay, Behavioral Snapshots, Real-time Prompt Diffing, and Agent DNA Viewer are crucial for internal testing and debugging. Automated evaluation frameworks can compare agent outputs against expected outcomes.
Prompt Engineering Testing:
Purpose: To test the robustness and consistency of prompts across different contexts and inputs.
Scope: LLM responses, prompt chaining variations, context sensitivity.
Tools: Loom Studio's Real-time Prompt Diffing and Prompt Injection Sandbox.
Integration with Genkit: Genkit's capabilities for testing and evaluation of AI flows will be leveraged to ensure consistency and performance of orchestrated AI services.
KLEPSYDRA Economic Simulation:
Purpose: To simulate the KLEPSYDRA Engine's economic behavior under various conditions, testing its profitability, user engagement curves, and stability.
Scope: Sine-Rhythm Engine (SRE) modulation, Profit Dials adjustments, Pity Boon triggers, Φ accrual, RTR and TV metrics.
Tools: Dedicated simulation environment within Loom Studio (The Loom of Fates) that can run "Sim Mode" silently on user cohorts.
Techniques: A/B testing different Profit Dial configurations, stress testing CrashGuard thresholds, and simulating user behavior archetypes (from Psyche-Matrix) to predict economic outcomes.
3.5. Performance Testing
Purpose: To assess system responsiveness, stability, and scalability under various load conditions.
Scope: API response times, workflow execution duration, Micro-App loading times, concurrent user capacity, Agent Action processing rates, KLEPSYDRA Engine calculation latency, Obelisk Pay transaction throughput.
Tools: Load testing tools (e.g., k6, JMeter), monitoring via Sentry, analytics tools, and internal APM (Application Performance Monitoring) dashboards for specific metrics.
Integration Points: Automated performance smoke tests in CD pipeline; dedicated load tests during release cycles.
3.6. Security Testing (Aegis Vigilance)
Security testing is deeply embedded, embodying the Aegis "build like he's watching" directive.
Static Application Security Testing (SAST):
Purpose: Identify security vulnerabilities in source code without execution.
Scope: All backend and frontend codebases.
Tools: Integrated into CI pipeline (e.g., GitHub Advanced Security, commercial SAST tools).
Dynamic Application Security Testing (DAST):
Purpose: Identify vulnerabilities in the running application from an attacker's perspective.
Scope: Deployed staging and production environments.
Tools: Integrated into CD pipeline (e.g., OWASP ZAP, commercial DAST scanners).
Dependency Security Scanning:
Action: Automate checks for known vulnerabilities in third-party libraries and packages.
Tools: Dependabot, Snyk, or similar.
Penetration Testing (Pen-Testing):
Purpose: Simulate real-world attacks by ethical hackers to uncover vulnerabilities.
Scope: Entire ΛΞVON OS platform (frontend, backend, APIs, cloud infrastructure), including attempts to manipulate KLEPSYDRA or Obelisk Pay.
Frequency: Conducted annually or semi-annually by third-party experts.
Compliance Audits: Regular audits to ensure adherence to relevant legal and regulatory requirements (e.g., HIPAA, GDPR, financial compliance for Obelisk Pay).
4. Test Coverage Requirements
Unit Test Coverage: Aim for a minimum of 80% line and branch coverage for critical business logic, core utilities, and API handlers.
Integration Test Coverage: Focus on high-value interactions and data flows between services, especially involving BEEP, Loom Studio, Aegis, Obelisk Pay, and KLEPSYDRA.
E2E Test Coverage: Ensure all critical user journeys (e.g., user login, BEEP command execution, Micro-App launch, workflow creation, security alert processing, Folly Instrument play, Obelisk Pay transactions, The Rite of Invocation) are covered by E2E tests.
AI Agent Test Coverage: Prioritize testing of agent goals, tool usage, memory integration, and key decision points, especially for Agent Governance Protocol compliance.
Economic Simulation Coverage: Ensure KLEPSYDRA simulations cover a wide range of user archetypes and economic conditions to validate profitability and stability.
5. Test Reporting & Quality Gates
CI/CD Integration: All test results are reported directly within GitHub Actions.
Quality Gates: Define strict quality gates in the CI/CD pipeline. No code is merged to main, and no deployment proceeds to staging or production, if critical tests (unit, integration, E2E, SAST, DAST) fail.
Sentry: All runtime errors from staging and production environments are logged and alerted via Sentry for rapid detection and resolution.
Dashboard Metrics: Key testing metrics (e.g., test pass rates, code coverage trends, defect counts) are visualized in internal dashboards to track overall quality.
