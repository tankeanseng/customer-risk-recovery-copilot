import { Suspense } from "react";

import { TracesClient } from "./traces-client";

export default function TracesPage() {
  return (
    <Suspense fallback={<div style={{ color: "var(--text-muted)" }}>Loading trace...</div>}>
      <TracesClient />
    </Suspense>
  );
}
