"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { fetchJson } from "../lib/api";

type Domain = "customers" | "invoices" | "payments" | "orders" | "notes" | "disputes" | "policies";

type SummaryResponse = {
  summary: Record<Domain, number>;
  domains: Domain[];
};

type RecordDetailResponse = {
  record_type: string;
  record_id: string;
  detail: Record<string, string | number | boolean | string[]>;
  linked_entities: {
    customer_id: string | null;
    case_ids: string[];
    related_payment_ids: string[];
    used_in_run_ids: string[];
  };
};

const domainLabels: Record<Domain, string> = {
  customers: "Customers",
  invoices: "Invoices",
  payments: "Payments",
  orders: "Orders",
  notes: "Notes",
  disputes: "Disputes",
  policies: "Policies",
};

const domainIdKey: Record<Domain, string> = {
  customers: "customer_id",
  invoices: "invoice_id",
  payments: "payment_id",
  orders: "order_id",
  notes: "note_id",
  disputes: "dispute_id",
  policies: "rule_id",
};

export default function DataExplorerPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [domain, setDomain] = useState<Domain>("customers");
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [search, setSearch] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RecordDetailResponse | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const response = await fetchJson<SummaryResponse>("/data/summary");
        if (cancelled) return;
        setSummary(response);
      } catch (error) {
        if (cancelled) return;
        setFeedback(error instanceof Error ? error.message : "Unable to load data summary.");
      }
    }

    void loadSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRows() {
      setLoading(true);
      setSelectedRecordId(null);
      setDetail(null);
      try {
        const response = await fetchJson<{ rows: Array<Record<string, unknown>> }>(`/data/${domain}`);
        if (cancelled) return;
        setRows(response.rows);
        setFeedback(null);
      } catch (error) {
        if (cancelled) return;
        setFeedback(error instanceof Error ? error.message : "Unable to load dataset.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRows();
    return () => {
      cancelled = true;
    };
  }, [domain]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedRecordId) return;

    async function loadDetail() {
      try {
        const response = await fetchJson<RecordDetailResponse>(`/data/records/${domain}/${selectedRecordId}`);
        if (cancelled) return;
        setDetail(response);
      } catch (error) {
        if (cancelled) return;
        setFeedback(error instanceof Error ? error.message : "Unable to load record detail.");
      }
    }

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [domain, selectedRecordId]);

  const filteredRows = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    if (!lowered) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(lowered)),
    );
  }, [rows, search]);

  const columns = filteredRows[0] ? Object.keys(filteredRows[0]) : [];
  const idKey = domainIdKey[domain];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h1 style={{ margin: 0 }}>Data Explorer</h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>
            Browse the built-in portfolio records that power the demo and connect them back to cases and traces.
          </p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search records"
          style={searchInputStyle}
        />
      </section>

      {feedback ? <div style={feedbackStyle}>{feedback}</div> : null}

      {summary ? (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 12 }}>
          {(summary.domains ?? Object.keys(domainLabels)).map((entry) => (
            <button
              key={entry}
              style={entry === domain ? selectedSummaryCardStyle : summaryCardStyle}
              onClick={() => setDomain(entry)}
            >
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{domainLabels[entry]}</div>
              <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>{summary.summary[entry]}</div>
            </button>
          ))}
        </section>
      ) : null}

      <section style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(summary?.domains ?? (Object.keys(domainLabels) as Domain[])).map((entry) => (
          <button key={entry} style={entry === domain ? activeTabStyle : tabStyle} onClick={() => setDomain(entry)}>
            {domainLabels[entry]}
          </button>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: detail ? "1.2fr 0.8fr" : "1fr", gap: 20 }}>
        <section style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <h2 style={panelTitleStyle}>{domainLabels[domain]}</h2>
            <div style={{ color: "var(--text-muted)" }}>
              {loading ? "Loading..." : `${filteredRows.length} rows`}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column} style={headerCellStyle}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const recordId = String(row[idKey]);
                  return (
                    <tr
                      key={recordId}
                      onClick={() => setSelectedRecordId(recordId)}
                      style={{
                        cursor: "pointer",
                        background: selectedRecordId === recordId ? "var(--accent-soft)" : "transparent",
                      }}
                    >
                      {columns.map((column) => (
                        <td key={column} style={cellStyle}>
                          {renderValue(row[column])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {detail ? (
          <aside style={panelStyle}>
            <h2 style={panelTitleStyle}>Record Detail</h2>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ color: "var(--text-muted)" }}>
                {detail.record_type} | {detail.record_id}
              </div>
              {Object.entries(detail.detail).map(([key, value]) => (
                <div key={key} style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 12 }}>
                  <div style={{ color: "var(--text-muted)" }}>{key}</div>
                  <div>{renderValue(value)}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <h3 style={subTitleStyle}>Linked Relationships</h3>
              <div style={{ display: "grid", gap: 8, color: "var(--text-muted)" }}>
                <div>Customer: {detail.linked_entities.customer_id ?? "N/A"}</div>
                <div>Cases: {detail.linked_entities.case_ids.join(", ") || "None"}</div>
                <div>Related Payments: {detail.linked_entities.related_payment_ids.join(", ") || "None"}</div>
                <div>Used In Runs: {detail.linked_entities.used_in_run_ids.join(", ") || "None"}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              {detail.linked_entities.case_ids[0] ? (
                <Link href={`/cases/${detail.linked_entities.case_ids[0]}`} style={secondaryLinkStyle}>
                  Open Case
                </Link>
              ) : null}
              {detail.linked_entities.used_in_run_ids[0] ? (
                <Link href={`/traces?runId=${detail.linked_entities.used_in_run_ids[0]}`} style={secondaryLinkStyle}>
                  Open Trace
                </Link>
              ) : null}
            </div>
          </aside>
        ) : null}
      </section>
    </div>
  );
}

function renderValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

const panelStyle: CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 20,
};

const panelTitleStyle: CSSProperties = { marginTop: 0, marginBottom: 14, fontSize: 20 };
const subTitleStyle: CSSProperties = { marginTop: 0, marginBottom: 10, fontSize: 16 };

const summaryCardStyle: CSSProperties = {
  textAlign: "left",
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 16,
};

const selectedSummaryCardStyle: CSSProperties = {
  ...summaryCardStyle,
  border: "1px solid var(--accent)",
  background: "var(--accent-soft)",
};

const tabStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid var(--border)",
  background: "var(--panel)",
  color: "var(--text-muted)",
  fontWeight: 600,
};

const activeTabStyle: CSSProperties = {
  ...tabStyle,
  background: "var(--accent)",
  border: "1px solid var(--accent)",
  color: "white",
};

const searchInputStyle: CSSProperties = {
  minWidth: 260,
  borderRadius: 12,
  border: "1px solid var(--border)",
  padding: "10px 12px",
  background: "var(--panel)",
  color: "var(--text)",
};

const feedbackStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--accent)",
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontWeight: 600,
};

const headerCellStyle: CSSProperties = {
  textAlign: "left",
  padding: "0 0 12px",
  borderBottom: "1px solid var(--border)",
  color: "var(--text-muted)",
  fontSize: 13,
  fontWeight: 700,
};

const cellStyle: CSSProperties = {
  padding: "14px 8px 14px 0",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "top",
};

const secondaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--panel)",
  color: "var(--text)",
  fontWeight: 600,
};
