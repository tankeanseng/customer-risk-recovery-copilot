# Customer Risk & Recovery Copilot Docs

This folder is the source of truth for the product and implementation plan.

Recommended build order:

1. Lock the written spec in these docs.
2. Create wireframe-level UI specs from the page contracts.
3. Scaffold the frontend and backend.
4. Implement the demo data and API contracts first.
5. Build the highest-value pages and workflows in slices.

Files:

- `project-spec.md`: product vision, client context, scope, workflow, and technology choices
- `data-model-and-demo-cases.md`: demo company, customer portfolio, entities, and realistic case patterns
- `page-specs-and-api-contracts.md`: page architecture, component structure, data flow, state model, and API shapes
- `ui-wireframes.md`: wireframe-level UI spec for every page, including layout, sections, components, and user flows
- `ui-detailed-page-spec.md`: high-fidelity written UI design spec for every page, including design principles, required components, buttons, states, and interactions
- `ui-visual-refinement.md`: page-by-page visual refinement, layout ratios, hierarchy, motion, and display rules for the final product feel
- `ui-visual-wireframes-key-pages.md`: implementation-ready visual wireframes for the 5 highest-priority pages, including desktop/mobile layout and component hierarchy
- `ui-visual-wireframes-remaining-pages.md`: implementation-ready visual wireframes for the remaining pages so the full app is covered before coding
- `operational-strategy.md`: how the product should work in production and in the public demo, including scan strategy, heuristics, and cost control
- `triage-and-heuristics.md`: exact portfolio triage scoring, trigger rules, AI escalation logic, and how heuristic results should appear in the UI
- `implementation-readiness-audit.md`: end-to-end audit of pages, buttons, APIs, state transitions, and critical integration dependencies
- `secrets-and-model-strategy.md`: environment secret plan, LangSmith decision, model evaluation strategy, and structured-output retry policy
- `model-evaluation.md`: first live case-review model evaluation results, repeatability findings, and recommended default model choice
- `langsmith-integration.md`: current LangSmith tracing scope, verification status, and planned expansion path
- `langgraph-learning.md`: beginner-friendly explanation of the first LangGraph workflow, including small code examples, state flow, and project-specific input/output examples
- `mcp-learning.md`: beginner-friendly explanation of MCP, including server/client examples and how the app now uses local MCP tool servers
- `completion-checklist.md`: code-scan-based build checklist of remaining pages, workflows, integrations, and deployment work
