import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: false,
  retries: 2,
  workers: 1,
  reporter: 'html',
  timeout: 120 * 1000,
  expect: {
    timeout: 7 * 1000,
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Additional Synpress-specific configuration can be added here
})
