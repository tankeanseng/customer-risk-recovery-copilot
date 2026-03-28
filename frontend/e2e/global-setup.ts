import fs from "fs";
import path from "path";

async function globalSetup() {
  const runtimeStateDir = path.resolve(__dirname, "../../backend/runtime_state_e2e");
  fs.rmSync(runtimeStateDir, { recursive: true, force: true });
}

export default globalSetup;
