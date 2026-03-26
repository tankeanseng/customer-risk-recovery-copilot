import "./globals.css";

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/cases", label: "Cases" },
  { href: "/simulator", label: "Simulator" },
  { href: "/approvals", label: "Approvals" },
  { href: "/traces", label: "Traces" },
  { href: "/evaluation", label: "Evaluation" },
  { href: "/optimization", label: "Optimization" },
  { href: "/data-explorer", label: "Data Explorer" },
  { href: "/architecture", label: "Architecture" },
];

export const metadata: Metadata = {
  title: "Customer Risk & Recovery Copilot",
  description: "Agentic AI decision-support for customer risk and recovery workflows.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "248px 1fr",
            minHeight: "100vh",
          }}
        >
          <aside
            style={{
              padding: "24px 18px",
              borderRight: "1px solid var(--border)",
              background: "var(--panel)",
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
                Demo App
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
                Customer Risk & Recovery Copilot
              </div>
            </div>

            <nav style={{ display: "grid", gap: 8 }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    color: "var(--text)",
                    background: "transparent",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div
              style={{
                marginTop: 24,
                padding: 14,
                borderRadius: 16,
                background: "var(--accent-soft)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Recommended Demo</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Horizon Foodservice Trading</div>
              <Link href="/portfolio" style={{ color: "var(--accent)", fontWeight: 600 }}>
                Start walkthrough
              </Link>
            </div>
          </aside>

          <main>
            <header
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "18px 24px",
                borderBottom: "1px solid var(--border)",
                background: "rgba(244, 246, 247, 0.94)",
                backdropFilter: "blur(8px)",
              }}
            >
              <input
                aria-label="Global search"
                defaultValue=""
                placeholder="Search customers, cases, traces..."
                style={{
                  width: "100%",
                  maxWidth: 420,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--panel)",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Demo Mode
                </span>
                <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Active runs: 1</span>
              </div>
            </header>

            <div style={{ padding: 24 }}>{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

