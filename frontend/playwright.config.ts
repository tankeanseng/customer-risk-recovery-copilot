import { defineConfig, devices } from "@playwright/test";
import path from "path";

const runtimeStateDir = path.resolve(__dirname, "../backend/runtime_state_e2e");

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  workers: 1,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  globalSetup: "./e2e/global-setup.ts",
  projects: [
    {
      name: "edge",
      use: {
        ...devices["Desktop Edge"],
        channel: "msedge",
      },
    },
  ],
  webServer: [
    {
      command: "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000",
      cwd: path.resolve(__dirname, "../backend"),
      url: "http://127.0.0.1:8000/health",
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        ...process.env,
        APP_STATE_DIR: runtimeStateDir,
      },
    },
    {
      command: "python scripts/serve_export.py --host 127.0.0.1 --port 3000 --directory out",
      cwd: path.resolve(__dirname),
      url: "http://127.0.0.1:3000",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
