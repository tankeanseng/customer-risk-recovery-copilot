export function PlaceholderPage(props: { title: string; description: string }) {
  return (
    <section style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, marginBottom: 8 }}>{props.title}</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 820 }}>{props.description}</p>
      </div>

      <div
        style={{
          border: "1px dashed var(--border)",
          borderRadius: 20,
          background: "var(--panel)",
          padding: 24,
          color: "var(--text-muted)",
        }}
      >
        Scaffolded route placeholder. This page will be replaced with the real implementation based on the locked wireframes and API contracts.
      </div>
    </section>
  );
}
