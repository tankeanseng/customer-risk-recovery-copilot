# Customer Risk & Recovery Copilot

## Product title

Customer Risk & Recovery Copilot

## One-line pitch

An AI decision-support web app that helps finance and operations teams detect risky customers, investigate payment deterioration, recommend next-best recovery actions, simulate alternative scenarios, and route sensitive decisions through human approval with full traceability.

## Why this project exists

The project is meant to be:

- a flagship AI engineering portfolio product
- a believable consulting project for companies in Singapore and Malaysia
- a public demo web app that interviewers can try without uploading their own data
- visibly agentic, measurable, and enterprise-safe

## Client company context

The demo client is:

- Straits Supply Partners
- a regional B2B distributor
- operating across Singapore and Malaysia
- selling business, hygiene, facility, pantry, packaging, and retail operating supplies

Typical customers:

- office operators
- restaurant groups
- cafes
- retail chains
- clinics
- hotels
- facilities management companies
- light industrial and warehouse operators

## Core business problem

The client extends trade credit to repeat customers. When payment behavior worsens, staff currently have to manually inspect:

- invoices
- payment history
- order trends
- notes and promise-to-pay records
- disputes
- policy rules

Then they decide what to do next:

- remind the customer
- call them
- offer a payment plan
- reduce credit limit
- pause new credit orders
- escalate to a manager

This process is slow, inconsistent, and hard to audit.

## Product goals

The app should:

- surface risky accounts in a realistic portfolio view
- run a multi-step AI review for a customer case
- show which data and tools the AI used
- generate typed, policy-aware recommendations
- support what-if scenario analysis
- pause for approval when actions are sensitive
- expose traces, evaluations, and optimization results

## Chosen technology stack

- Next.js frontend
- FastAPI backend
- AWS Lambda + API Gateway
- CloudFront
- OpenAI API
- LiteLLM
- LangGraph
- MCP
- structured outputs
- Pydantic models
- agent evals
- Phoenix or LangSmith
- DSPy

## Explicit non-goals

The project should not be centered around:

- another RAG-heavy document assistant
- GraphRAG as the main story
- QLoRA
- vLLM
- browser agents
- A2A

Those may be known background skills, but they are not the headline of this product.

## Core AI workflow

1. Case Intake Agent
2. Financial Risk Agent
3. Relationship Agent
4. Policy Check Agent
5. Recovery Strategy Agent
6. Approval Router

All major outputs should be strict structured objects.

## Multiple MCP servers

- `customer-profile-mcp`
- `ar-analytics-mcp`
- `notes-policy-mcp`
- `case-actions-mcp`

## Main user journey

1. Open the portfolio dashboard
2. Choose a risky customer
3. Open the customer case page
4. Run AI review
5. Inspect the workflow trace
6. Change assumptions in the simulator
7. Review the changed recommendation
8. Submit for approval when needed
9. Inspect evaluations and architecture

## What makes this advanced

- visible specialist-agent workflow
- multiple MCP-backed tools
- durable workflow with approval interrupts
- typed outputs
- what-if simulation
- trace-first AI transparency
- evaluation and optimization pages
- model routing via LiteLLM

## Primary pages

- Overview
- Portfolio
- Customer Case
- AI Workflow Trace
- What-If Simulator
- Cases
- Approvals
- Evaluation
- Optimization
- Data Explorer
- Architecture

