"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { portfolioRows } from "../lib/demo-data";

export default function PortfolioPage() {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [refreshStamp, setRefreshStamp] = useState("Just now");

  const filteredRows = useMemo(() => {
    return portfolioRows.filter((row) => {
      const matchesQuery =
        query.trim().length === 0 ||
        row.customerName.toLowerCase().includes(query.toLowerCase()) ||
        row.segment.toLowerCase().includes(query.toLowerCase()) ||
        row.region.toLowerCase().includes(query.toLowerCase());
      const matchesRisk = riskFilter === "All" || row.riskBand === riskFilter;
      return matchesQuery && matchesRisk;
    });
  }, [query, riskFilter]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end" }}>
        <div>
          <h1 style={{ margin: 0 }}>Portfolio</h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>
            Portfolio-wide triage and selective AI review workspace for flagged customers.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customers..."
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border)", minWidth: 260 }}
          />
          <button style={buttonStyle(false)} onClick={() => setRefreshStamp(new Date().toLocaleTimeString())}>
            Refresh
          </button>
          <Link href="/portfolio?walkthrough=demo&step=portfolio" style={linkButtonStyle(true)}>
            Start Guided Demo
          </Link>
        </div>
      </section>

      <section style={panelStyle}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["All", "Low", "Watchlist", "High", "Critical"].map((label) => (
            <button
              key={label}
              onClick={() => setRiskFilter(label)}
              style={label === riskFilter ? activeFilterPillStyle : filterPillStyle}
            >
              {label}
            </button>
          ))}
          <button
            style={buttonStyle(false)}
            onClick={() => {
              setQuery("");
              setRiskFilter("All");
            }}
          >
            Reset
          </button>
          <div style={{ color: "var(--text-muted)", alignSelf: "center" }}>Refreshed: {refreshStamp}</div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 14 }}>
        {[
          ["Exposure", "2.18M"],
          ["Overdue", "1.03M"],
          ["High Risk", "6"],
          ["Approval Needed", "2"],
          ["Triage Flagged", "8"],
          ["AI Review Recommended", "5"],
        ].map(([label, value]) => (
          <div key={label} style={panelStyle}>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{label}</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 20 }}>
        <section style={panelStyle}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: 13 }}>
                  {["Customer", "Segment", "Region", "Triage", "Risk", "Overdue", "Triggers", "Recommendation", "Mode", "Actions"].map(
                    (heading) => (
                      <th key={heading} style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.caseId}>
                    <td style={cellStyle}>
                      <Link href={`/cases/${row.caseId}`} style={{ fontWeight: 700 }}>
                        {row.customerName}
                      </Link>
                    </td>
                    <td style={cellStyle}>{row.segment}</td>
                    <td style={cellStyle}>{row.region}</td>
                    <td style={cellStyle}>
                      <span style={chipStyle}>{row.triageScore}</span>
                    </td>
                    <td style={cellStyle}>{row.riskBand}</td>
                    <td style={cellStyle}>{row.overdueBalance}</td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {row.triggers.map((trigger) => (
                          <span key={trigger} style={miniChipStyle}>
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={cellStyle}>{row.recommendation}</td>
                    <td style={cellStyle}>{row.reviewMode}</td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Link href={`/cases/${row.caseId}?walkthrough=demo&step=case`} style={inlineLinkStyle}>
                          Open Case
                        </Link>
                        <Link href={`/cases/${row.caseId}?walkthrough=demo&step=case`} style={inlineLinkStyle}>
                          Run Review
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ display: "grid", gap: 20 }}>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Critical now</h2>
            <ul style={listStyle}>
              <li>Titan Facility Management</li>
              <li>GreenWave Hospitality Group</li>
            </ul>
          </section>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Newly flagged</h2>
            <ul style={listStyle}>
              <li>Horizon Foodservice Trading</li>
              <li>Summit Lifestyle Retail</li>
            </ul>
          </section>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Simulation-ready</h2>
            <ul style={listStyle}>
              <li>Horizon Foodservice Trading</li>
            </ul>
          </section>
        </section>
      </section>
    </div>
  );
}

const panelStyle: CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 20,
};

const filterPillStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "var(--panel-muted)",
  border: "1px solid var(--border)",
  color: "var(--text-muted)",
};

const activeFilterPillStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "var(--accent-soft)",
  border: "1px solid var(--accent)",
  color: "var(--accent)",
};

const buttonStyle = (primary: boolean): CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 12,
  border: primary ? "1px solid var(--accent)" : "1px solid var(--border)",
  background: primary ? "var(--accent)" : "var(--panel)",
  color: primary ? "white" : "var(--text)",
  fontWeight: 600,
});

const linkButtonStyle = (primary: boolean): CSSProperties => buttonStyle(primary);

const cellStyle: CSSProperties = {
  padding: "12px 8px",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "top",
};

const chipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontWeight: 700,
  fontSize: 12,
};

const miniChipStyle: CSSProperties = {
  padding: "5px 8px",
  borderRadius: 999,
  background: "var(--panel-muted)",
  border: "1px solid var(--border)",
  fontSize: 12,
  color: "var(--text-muted)",
};

const inlineLinkStyle: CSSProperties = {
  color: "var(--accent)",
  fontWeight: 600,
  fontSize: 14,
};

const panelTitleStyle: CSSProperties = { marginTop: 0, marginBottom: 10, fontSize: 18 };
const listStyle: CSSProperties = { margin: 0, paddingLeft: 18, color: "var(--text-muted)" };
