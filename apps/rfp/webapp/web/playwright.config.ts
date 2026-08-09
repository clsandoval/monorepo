import { defineConfig, devices } from "@playwright/test";

const PORT = 3980;
export default defineConfig({
  testDir: "./qa/e2e",
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "off", ...devices["Desktop Chrome"] },
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
    env: {
      RFP_DIR: "/home/clsandoval/cs/monorepo/apps/rfp",
      RFP_SESSIONS_DIR: "/home/clsandoval/cs/monorepo/apps/rfp/webapp/web/.sessions-e2e",
    },
  },
});
