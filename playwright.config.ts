import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
        (existsSync(edge) ? edge : undefined),
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "node --import tsx scripts/e2e-server.ts",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 180000,
  },
});
