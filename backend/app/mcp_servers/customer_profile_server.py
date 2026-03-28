from typing import Any

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("customer-profile-mcp")


@mcp.tool()
def get_customer_profile(
    case_id: str,
    customer_name: str,
    segment: str,
    region: str,
    strategic: str,
    tier: str,
    credit_limit: float,
    payment_terms: str,
) -> dict[str, Any]:
    relationship_flag = "strategic_account" if str(strategic).lower() == "yes" else "standard_account"
    return {
        "case_id": case_id,
        "customer_name": customer_name,
        "portfolio_profile": {
            "segment": segment,
            "region": region,
            "tier": tier,
            "relationship_flag": relationship_flag,
        },
        "commercial_terms": {
            "credit_limit": credit_limit,
            "payment_terms": payment_terms,
        },
        "summary": f"{customer_name} is a {tier} {segment} account in {region} with {payment_terms} terms.",
    }


if __name__ == "__main__":
    mcp.run()
