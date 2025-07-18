import { test } from "@playwright/test"

test("simple check - app loads", async ({ page }) => {
  await page.goto("/")
  await page.waitForLoadState("networkidle")

  // Check if connect button is visible
  const connectButton = page.getByTestId("ockConnectButton")
  await test.expect(connectButton).toBeVisible()

  console.log("✅ App loaded successfully")
  console.log("Connect button is visible")
})
