from typing import Any

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("notes-policy-mcp")


@mcp.tool()
def get_policy_context(
    case_id: str,
    triage_score: int,
    triage_risk_band: str,
    hard_trigger_hit: bool,
    policy_summary: list[str],
) -> dict[str, Any]:
    approval_watch = hard_trigger_hit or triage_score >= 80 or triage_risk_band == "Critical"
    return {
        "case_id": case_id,
        "approval_watch": approval_watch,
        "policy_summary": policy_summary,
        "summary": (
            "Policy context indicates elevated approval sensitivity."
            if approval_watch
            else "Policy context indicates monitoring without immediate approval escalation."
        ),
    }


if __name__ == "__main__":
    mcp.run()
