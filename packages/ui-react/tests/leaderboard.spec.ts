import { expect, test } from "@playwright/test"

test.describe("Leaderboard", () => {
  test("should open leaderboard panel when leaderboard button is clicked", async ({ page }) => {
    console.log("\n=== TESTING LEADERBOARD FUNCTIONALITY ===")

    await page.goto("/coinToss.html")
    await page.waitForLoadState("networkidle")
    console.log("✅ Navigated to coin toss game page")

    const leaderboardButton = page.getByLabel("Open Leaderboard")
    await expect(leaderboardButton).toBeVisible()
    console.log("✅ Leaderboard button is visible")

    await leaderboardButton.click()
    console.log("✅ Clicked leaderboard button")

    const leaderboardPanelTitle = page.getByRole("heading", { name: "Leaderboards" })
    await expect(leaderboardPanelTitle).toBeVisible({ timeout: 5000 })
    console.log("✅ Leaderboard panel opened with correct title")

    const partnerToggleLabel = page.getByText("Show partner leaderboards")
    await expect(partnerToggleLabel).toBeVisible()
    console.log("✅ Partner toggle label is visible")

    const partnerToggle = page.locator("#partner-toggle")
    await expect(partnerToggle).toBeVisible()
    console.log("✅ Partner toggle switch is visible")

    console.log("🎉 All leaderboard functionality tests passed!")
  })

  test("should toggle partner leaderboards when switch is clicked", async ({ page }) => {
    console.log("\n=== TESTING PARTNER LEADERBOARD TOGGLE ===")

    await page.goto("/coinToss.html")
    await page.waitForLoadState("networkidle")

    const leaderboardButton = page.getByLabel("Open Leaderboard")
    await leaderboardButton.click()

    const leaderboardPanelTitle = page.getByRole("heading", { name: "Leaderboards" })
    await expect(leaderboardPanelTitle).toBeVisible({ timeout: 5000 })

    const partnerToggle = page.locator("#partner-toggle")
    await expect(partnerToggle).toBeVisible()

    const isInitiallyChecked = await partnerToggle.isChecked()
    console.log(`Initial toggle state: ${isInitiallyChecked ? "checked" : "unchecked"}`)

    await partnerToggle.click()
    console.log("✅ Clicked partner toggle")

    const isNowChecked = await partnerToggle.isChecked()
    expect(isNowChecked).toBe(!isInitiallyChecked)
    console.log(`Toggle state after click: ${isNowChecked ? "checked" : "unchecked"}`)

    await partnerToggle.click()
    const isFinalState = await partnerToggle.isChecked()
    expect(isFinalState).toBe(isInitiallyChecked)
    console.log(`Final toggle state: ${isFinalState ? "checked" : "unchecked"}`)

    console.log("🎉 Partner toggle functionality works correctly!")
  })

  test("should be accessible from different game pages", async ({ page }) => {
    console.log("\n=== TESTING LEADERBOARD ACCESS FROM DIFFERENT GAMES ===")

    const gamePages = [
      "/coinToss.html",
      "/dice.html",
      "/roulette.html",
      "/keno.html",
      "/wheel.html",
    ]

    for (const gamePage of gamePages) {
      console.log(`Testing leaderboard on ${gamePage}`)

      await page.goto(gamePage)
      await page.waitForLoadState("networkidle")

      const leaderboardButton = page.getByLabel("Open Leaderboard")
      await expect(leaderboardButton).toBeVisible()

      await leaderboardButton.click()
      const leaderboardPanelTitle = page.getByRole("heading", { name: "Leaderboards" })
      await expect(leaderboardPanelTitle).toBeVisible({ timeout: 5000 })

      await page.keyboard.press("Escape")
      await expect(leaderboardPanelTitle).not.toBeVisible({ timeout: 3000 })

      console.log(`✅ Leaderboard works correctly on ${gamePage}`)
    }

    console.log("🎉 Leaderboard is accessible from all tested game pages!")
  })
})
