# MCP Learning Notes

`MCP` stands for `Model Context Protocol`.

It is a standard way for an AI application to talk to external context providers such as:

- tools
- resources
- prompts

## Smallest mental model

Think of MCP like this:

```text
AI workflow -> MCP client -> MCP server -> tool/resource -> result
```

In our app:

```text
LangGraph review workflow -> MCP client -> local MCP servers -> customer/AR/policy context -> review continues
```

## The 3 main MCP pieces

### 1. MCP server
This exposes tools or resources.

### 2. MCP client
This connects to a server and calls those tools or reads those resources.

### 3. Tool call result
The server returns structured data the workflow can use.

## Tiny server example

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("hello-mcp")


@mcp.tool()
def greet(name: str) -> dict[str, str]:
    return {
        "message": f"Hello, {name}!"
    }


if __name__ == "__main__":
    mcp.run()
```

### Input

```python
{"name": "Farah"}
```

### Output

```python
{
  "message": "Hello, Farah!"
}
```

## Tiny client example

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import asyncio


async def run():
    params = StdioServerParameters(
        command="python",
        args=["-m", "my_server_module"],
    )

    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool("greet", arguments={"name": "Farah"})
            print(result.structuredContent)


asyncio.run(run())
```

### Output

```python
{
  "message": "Hello, Farah!"
}
```

## What the important MCP code means

### `FastMCP(...)`
Creates a server.

```python
mcp = FastMCP("hello-mcp")
```

### `@mcp.tool()`
Registers a function as a callable MCP tool.

```python
@mcp.tool()
def greet(name: str) -> dict[str, str]:
    ...
```

### `StdioServerParameters(...)`
Tells the client how to launch the server process.

```python
params = StdioServerParameters(
    command="python",
    args=["-m", "my_server_module"],
)
```

### `stdio_client(...)`
Starts a client connection over stdio.

### `ClientSession(...)`
Creates the actual MCP client session.

### `session.call_tool(...)`
Calls a named tool on the server.

```python
result = await session.call_tool("greet", arguments={"name": "Farah"})
```

## Our project example

We now have 3 local MCP servers:

- `customer-profile-mcp`
- `ar-analytics-mcp`
- `notes-policy-mcp`

And the LangGraph intake step calls them before the model review.

## Real server example from this project

```python
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
) -> dict:
    relationship_flag = "strategic_account" if strategic.lower() == "yes" else "standard_account"
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
```

### Input example

```python
{
  "case_id": "case_012",
  "customer_name": "Horizon Foodservice Trading Sdn Bhd",
  "segment": "Hospitality & F&B",
  "region": "Malaysia",
  "strategic": "No",
  "tier": "Core",
  "credit_limit": 110000.0,
  "payment_terms": "Net 30"
}
```

### Output example

```python
{
  "case_id": "case_012",
  "customer_name": "Horizon Foodservice Trading Sdn Bhd",
  "portfolio_profile": {
    "segment": "Hospitality & F&B",
    "region": "Malaysia",
    "tier": "Core",
    "relationship_flag": "standard_account"
  },
  "commercial_terms": {
    "credit_limit": 110000.0,
    "payment_terms": "Net 30"
  },
  "summary": "Horizon Foodservice Trading Sdn Bhd is a Core Hospitality & F&B account in Malaysia with Net 30 terms."
}
```

## How our backend uses MCP

The backend client calls the servers like this:

```python
result = await session.call_tool(
    "get_customer_profile",
    arguments={
        "case_id": "case_012",
        "customer_name": "Horizon Foodservice Trading Sdn Bhd",
        "segment": "Hospitality & F&B",
        "region": "Malaysia",
        "strategic": "No",
        "tier": "Core",
        "credit_limit": 110000.0,
        "payment_terms": "Net 30",
    },
)
```

Then the workflow receives structured context such as:

```python
{
  "profile": {...},
  "analytics": {...},
  "policy": {...},
  "tool_summaries": [...]
}
```

## Why MCP is useful here

Without MCP:

```text
workflow -> random direct helper functions
```

With MCP:

```text
workflow -> standard client -> named tool servers
```

That gives us:

- cleaner boundaries
- easier modularity
- more believable enterprise architecture
- traceable tool calls in LangSmith and the trace page

## Important note for this project

Right now we are using:

- local MCP servers
- stdio transport
- tools only

We are **not yet** using:

- MCP resources
- MCP prompts
- remote MCP servers
- Lambda/S3-hosted MCP deployment

That is intentional. This is the smallest useful first slice.
