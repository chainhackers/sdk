import { defineConfig } from "@playwright/test"
import { defineSynpressConfig } from "@synthetixio/synpress"
import { config } from "./app.config"

export default defineConfig(
  defineSynpressConfig({
    testDir: "./tests",
    timeout: 120000,
    fullyParallel: false,
    forbidOnly: false,
    retries: 2,
    workers: 1,
    reporter: "html",
    expect: {
      timeout: 7000,
    },
    use: {
      headless: false,
      chromiumChannel: "chromium",
      baseURL: config.baseUrl,
      actionTimeout: 60000,
      trace: "on-first-retry",
      video: "retain-on-failure",
    },
  }),
)
