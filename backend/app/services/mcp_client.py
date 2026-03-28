import asyncio
import json
import os
import sys
from typing import Any

from langsmith import traceable
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from app.mcp_servers.ar_analytics_server import get_ar_snapshot
from app.mcp_servers.customer_profile_server import get_customer_profile
from app.mcp_servers.notes_policy_server import get_policy_context


def _python_command() -> str:
    return sys.executable or "python"


def _server_module_for_name(server_name: str) -> str:
    mapping = {
        "customer-profile-mcp": "app.mcp_servers.customer_profile_server",
        "ar-analytics-mcp": "app.mcp_servers.ar_analytics_server",
        "notes-policy-mcp": "app.mcp_servers.notes_policy_server",
    }
    return mapping[server_name]


def _local_tool_for_name(server_name: str, tool_name: str):
    mapping = {
        ("customer-profile-mcp", "get_customer_profile"): get_customer_profile,
        ("ar-analytics-mcp", "get_ar_snapshot"): get_ar_snapshot,
        ("notes-policy-mcp", "get_policy_context"): get_policy_context,
    }
    return mapping[(server_name, tool_name)]


async def _call_tool_async(server_name: str, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    params = StdioServerParameters(
        command=_python_command(),
        args=["-m", _server_module_for_name(server_name)],
        env={**os.environ},
    )

    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool(tool_name, arguments=arguments)
            text_blocks = []
            for block in result.content:
                text = getattr(block, "text", None)
                if text is not None:
                    text_blocks.append(text)
            structured = result.structuredContent
            return {
                "server_name": server_name,
                "tool_name": tool_name,
                "arguments": arguments,
                "text_content": text_blocks,
                "structured_content": structured if isinstance(structured, dict) else {},
                "transport": "stdio",
            }


def _call_tool_locally(server_name: str, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    tool = _local_tool_for_name(server_name, tool_name)
    structured = tool(**arguments)
    return {
        "server_name": server_name,
        "tool_name": tool_name,
        "arguments": arguments,
        "text_content": [],
        "structured_content": structured if isinstance(structured, dict) else {},
        "transport": "in_process_fallback",
    }


@traceable(name="mcp_tool_call", run_type="tool")
def call_mcp_tool(server_name: str, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    try:
        result = asyncio.run(_call_tool_async(server_name, tool_name, arguments))
    except (PermissionError, OSError):
        # Windows stdio subprocess creation can be blocked in some local sandboxes.
        # Fall back to the same underlying tool logic in-process so the workflow
        # remains functional and deployment-safe.
        result = _call_tool_locally(server_name, tool_name, arguments)
    summary_source = result["structured_content"] or {"summary": "MCP tool completed without structured content."}
    return {
        "server_name": server_name,
        "tool_name": tool_name,
        "arguments_summary": json.dumps(arguments, ensure_ascii=True),
        "output_summary": str(summary_source.get("summary", summary_source)),
        "structured_content": summary_source,
        "transport": result["transport"],
    }


def gather_case_mcp_context(case_payload: dict[str, Any]) -> dict[str, Any]:
    triage = case_payload.get("triage", {})

    profile = call_mcp_tool(
        "customer-profile-mcp",
        "get_customer_profile",
        {
            "case_id": case_payload["case_id"],
            "customer_name": case_payload["customer_name"],
            "segment": case_payload["segment"],
            "region": case_payload["region"],
            "strategic": case_payload["strategic"],
            "tier": case_payload["tier"],
            "credit_limit": case_payload["credit_limit"],
            "payment_terms": case_payload["payment_terms"],
        },
    )
    analytics = call_mcp_tool(
        "ar-analytics-mcp",
        "get_ar_snapshot",
        {
            "case_id": case_payload["case_id"],
            "baseline_risk_band": case_payload["baseline_risk_band"],
            "baseline_risk_score": case_payload["baseline_risk_score"],
            "risk_drivers": case_payload["risk_drivers"],
            "notes": case_payload["notes"],
        },
    )
    policy = call_mcp_tool(
        "notes-policy-mcp",
        "get_policy_context",
        {
            "case_id": case_payload["case_id"],
            "triage_score": triage.get("triage_score", 0),
            "triage_risk_band": triage.get("risk_band", case_payload["baseline_risk_band"]),
            "hard_trigger_hit": triage.get("hard_trigger_hit", False),
            "policy_summary": case_payload["policy_summary"],
        },
    )

    return {
        "profile": profile["structured_content"],
        "analytics": analytics["structured_content"],
        "policy": policy["structured_content"],
        "tool_summaries": [
            {
                "server_name": profile["server_name"],
                "tool_name": profile["tool_name"],
                "output_summary": profile["output_summary"],
                "transport": profile["transport"],
            },
            {
                "server_name": analytics["server_name"],
                "tool_name": analytics["tool_name"],
                "output_summary": analytics["output_summary"],
                "transport": analytics["transport"],
            },
            {
                "server_name": policy["server_name"],
                "tool_name": policy["tool_name"],
                "output_summary": policy["output_summary"],
                "transport": policy["transport"],
            },
        ],
    }
