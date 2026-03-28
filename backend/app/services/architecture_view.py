from app.schemas.architecture import (
    ArchitectureHero,
    ArchitectureResponse,
    DeploymentTopologyItem,
    McpTopologyItem,
    ProductFlowStep,
    SpecialistAgentItem,
    TechnicalArchitectureBlock,
)


def get_architecture_view() -> ArchitectureResponse:
    return ArchitectureResponse(
        hero=ArchitectureHero(
            title="Architecture",
            description=(
                "This app combines portfolio triage, live AI review, traceability, and evaluation in a static-frontend "
                "+ serverless-backend architecture that is designed to stay cost-conscious while still feeling advanced."
            ),
            highlights=[
                "LangGraph now used for the first case-review workflow",
                "MCP now used for the first local tool-access slice",
                "LiteLLM already used for live model routing",
                "OpenAI already used for live case review",
                "LangSmith already used for tracing the live review path",
                "Evaluations already powered by saved real model results",
            ],
        ),
        product_flow=[
            ProductFlowStep(label="Portfolio Monitoring", summary="Heuristic triage scans the portfolio and flags accounts for attention."),
            ProductFlowStep(label="Customer Case Review", summary="Users open a case and inspect financial, qualitative, and policy context."),
            ProductFlowStep(label="Live AI Review", summary="A live structured recommendation is generated through LiteLLM and OpenAI."),
            ProductFlowStep(label="Recommendation And Approval", summary="Sensitive actions can be routed into an approval workflow."),
            ProductFlowStep(label="Simulation", summary="Users test scenario changes and inspect decision deltas."),
            ProductFlowStep(label="Trace And Evaluation", summary="Runs are traced and model quality is measured through evaluation artifacts."),
        ],
        technical_architecture=[
            TechnicalArchitectureBlock(
                layer="Frontend",
                components=["Next.js App Router", "Static export", "CloudFront target hosting"],
                status="partially_live",
            ),
            TechnicalArchitectureBlock(
                layer="API",
                components=["FastAPI", "JSON APIs", "API Gateway + Lambda target deployment"],
                status="partially_live",
            ),
            TechnicalArchitectureBlock(
                layer="AI Runtime",
                components=["LiteLLM SDK", "OpenAI GPT-5.4-mini", "Pydantic structured validation"],
                status="live",
            ),
            TechnicalArchitectureBlock(
                layer="Orchestration",
                components=["LangGraph live for case-review workflow", "Approval interrupt/resume planned", "Multi-agent graph expansion planned"],
                status="partially_live",
            ),
            TechnicalArchitectureBlock(
                layer="Tooling And Data Access",
                components=["MCP tools live for first local slice", "Current demo data in local artifacts", "S3-backed data strategy planned"],
                status="partially_live",
            ),
            TechnicalArchitectureBlock(
                layer="Observability And Quality",
                components=["LangSmith tracing live", "Saved eval artifacts live", "DSPy optimization page planned"],
                status="partially_live",
            ),
        ],
        mcp_topology=[
            McpTopologyItem(
                name="customer-profile-mcp",
                responsibility="Customer master profile, commercial tier, and account metadata.",
                status="partially_live",
            ),
            McpTopologyItem(
                name="ar-analytics-mcp",
                responsibility="Invoice aging, payment behavior, and order trend analytics.",
                status="partially_live",
            ),
            McpTopologyItem(
                name="notes-policy-mcp",
                responsibility="Notes, disputes, and policy-rule retrieval.",
                status="partially_live",
            ),
            McpTopologyItem(
                name="case-actions-mcp",
                responsibility="Case actions, approval state, and workflow event mutation.",
                status="planned",
            ),
        ],
        specialist_agents=[
            SpecialistAgentItem(name="Case Intake Agent", purpose="Shapes the review scope and required evidence.", status="partially_live"),
            SpecialistAgentItem(name="Financial Risk Agent", purpose="Interprets aging, exposure, and payment deterioration.", status="planned"),
            SpecialistAgentItem(name="Relationship Agent", purpose="Balances qualitative account context and strategic importance.", status="planned"),
            SpecialistAgentItem(name="Policy Check Agent", purpose="Checks approval and threshold rules before action.", status="partially_live"),
            SpecialistAgentItem(name="Recovery Strategy Agent", purpose="Generates the recommended recovery action and next steps.", status="partially_live"),
        ],
        deployment_topology=[
            DeploymentTopologyItem(
                area="Frontend Hosting",
                current_state="Runs locally as Next.js static export build output.",
                target_state="Static assets deployed to S3 and served through CloudFront.",
            ),
            DeploymentTopologyItem(
                area="Backend API Path",
                current_state="Runs locally as FastAPI app.",
                target_state="FastAPI deployed via API Gateway and AWS Lambda.",
            ),
            DeploymentTopologyItem(
                area="State And Persistence",
                current_state="Mock/demo state stored in repository artifacts.",
                target_state="Durable run and data snapshots stored in S3 or lightweight external storage.",
            ),
            DeploymentTopologyItem(
                area="AI Layer",
                current_state="LiteLLM SDK calls OpenAI directly for live case review.",
                target_state="LiteLLM + LangGraph + MCP-backed workflow with traced multi-step execution.",
            ),
        ],
        notes=[
            "The page intentionally distinguishes live pieces from planned pieces so the architecture story stays honest.",
            "CloudFront + Lambda compatibility is a design constraint for ongoing implementation.",
            "LangGraph and MCP are now live in the first case-review slice, while broader multi-agent expansion is still planned.",
        ],
    )
