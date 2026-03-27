"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type ArchitectureResponse = {
  hero: {
    title: string;
    description: string;
    highlights: string[];
  };
  product_flow: Array<{
    label: string;
    summary: string;
  }>;
  technical_architecture: Array<{
    layer: string;
    components: string[];
    status: string;
  }>;
  mcp_topology: Array<{
    name: string;
    responsibility: string;
    status: string;
  }>;
  specialist_agents: Array<{
    name: string;
    purpose: string;
    status: string;
  }>;
  deployment_topology: Array<{
    area: string;
    current_state: string;
    target_state: string;
  }>;
  notes: string[];
};

async function fetchArchitecture(): Promise<ArchitectureResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api"}/architecture`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return (await response.json()) as ArchitectureResponse;
}

export default function ArchitecturePage() {
  const [data, setData] = useState<ArchitectureResponse | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetchArchitecture();
        if (cancelled) return;
        setData(response);
      } catch (error) {
        if (cancelled) return;
        setFeedback(error instanceof Error ? error.message : "Unable to load architecture.");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return <div style={{ color: "var(--text-muted)" }}>{feedback ?? "Loading architecture..."}</div>;
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={heroStyle}>
        <div>
          <h1 style={{ margin: 0 }}>{data.hero.title}</h1>
          <p style={{ marginTop: 10, color: "var(--text-muted)", maxWidth: 900 }}>{data.hero.description}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {data.hero.highlights.map((highlight) => (
            <span key={highlight} style={chipStyle}>
              {highlight}
            </span>
          ))}
        </div>
      </section>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Product Flow</h2>
        <div style={flowRowStyle}>
          {data.product_flow.map((step, index) => (
            <div key={step.label} style={flowCardStyle}>
              <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Step {index + 1}</div>
              <div style={{ marginTop: 8, fontWeight: 700 }}>{step.label}</div>
              <div style={{ marginTop: 8, color: "var(--text-muted)" }}>{step.summary}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Technical Architecture</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {data.technical_architecture.map((block) => (
            <div key={block.layer} style={architectureBlockStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>{block.layer}</div>
                <span style={statusChip(block.status)}>{formatStatus(block.status)}</span>
              </div>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "var(--text-muted)" }}>
                {block.components.map((component) => (
                  <li key={component} style={{ marginBottom: 6 }}>
                    {component}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>MCP Topology</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {data.mcp_topology.map((item) => (
              <div key={item.name} style={topologyCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <span style={statusChip(item.status)}>{formatStatus(item.status)}</span>
                </div>
                <div style={{ marginTop: 8, color: "var(--text-muted)" }}>{item.responsibility}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Specialist Agents</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {data.specialist_agents.map((item) => (
              <div key={item.name} style={topologyCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <span style={statusChip(item.status)}>{formatStatus(item.status)}</span>
                </div>
                <div style={{ marginTop: 8, color: "var(--text-muted)" }}>{item.purpose}</div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Deployment Topology</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {data.deployment_topology.map((item) => (
            <div key={item.area} style={deploymentCardStyle}>
              <div style={{ fontWeight: 700 }}>{item.area}</div>
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
                <div style={{ color: "var(--text-muted)" }}>Current</div>
                <div>{item.current_state}</div>
                <div style={{ color: "var(--text-muted)" }}>Target</div>
                <div>{item.target_state}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Notes</h2>
        <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
          {data.notes.map((note) => (
            <li key={note} style={{ marginBottom: 8 }}>
              {note}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusChip(status: string): CSSProperties {
  if (status === "live") {
    return {
      ...chipStyle,
      background: "#e6f5ee",
      color: "#1d7a46",
      border: "1px solid #c8ead8",
    };
  }

  if (status === "partially_live") {
    return {
      ...chipStyle,
      background: "#fff3df",
      color: "#9b5b00",
      border: "1px solid #f3d49d",
    };
  }

  return {
    ...chipStyle,
    background: "var(--panel-muted)",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
  };
}

const heroStyle: CSSProperties = {
  background: "linear-gradient(135deg, var(--panel) 0%, var(--panel-muted) 100%)",
  border: "1px solid var(--border)",
  borderRadius: 22,
  padding: 24,
  display: "grid",
  gap: 16,
};

const panelStyle: CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 20,
};

const panelTitleStyle: CSSProperties = { marginTop: 0, marginBottom: 14, fontSize: 20 };

const chipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const flowRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
  gap: 12,
};

const flowCardStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 16,
  background: "var(--panel-muted)",
};

const architectureBlockStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 16,
  background: "var(--panel-muted)",
};

const topologyCardStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 16,
  background: "var(--panel-muted)",
};

const deploymentCardStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 16,
  background: "var(--panel-muted)",
};
