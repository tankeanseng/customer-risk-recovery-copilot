from typing import Any

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("ar-analytics-mcp")


@mcp.tool()
def get_ar_snapshot(
    case_id: str,
    baseline_risk_band: str,
    baseline_risk_score: int,
    risk_drivers: list[str],
    notes: list[str],
) -> dict[str, Any]:
    driver_count = len(risk_drivers)
    note_count = len(notes)
    severity = "elevated" if baseline_risk_score >= 70 else "moderate"
    return {
        "case_id": case_id,
        "risk_snapshot": {
            "baseline_risk_band": baseline_risk_band,
            "baseline_risk_score": baseline_risk_score,
            "severity": severity,
            "driver_count": driver_count,
            "note_count": note_count,
        },
        "summary": (
            f"AR analytics sees {severity} risk with {driver_count} major drivers "
            f"and {note_count} recent note signals."
        ),
    }


if __name__ == "__main__":
    mcp.run()
