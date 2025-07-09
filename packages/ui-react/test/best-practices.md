# E2E Testing Best Practices for BetSwirl SDK

This document outlines best practices for writing E2E tests with Playwright and Synpress for the BetSwirl SDK UI components.

## General Playwright Best Practices

### 1. Test User-Visible Behavior
- Focus on testing what end users see and interact with
- Don't test implementation details
- Test the outcome, not the method

### 2. Test Isolation
- Each test should run independently with its own state
- Don't depend on test execution order
- Clean up after tests when necessary

### 3. Use Proper Locators
```typescript
// ❌ Bad - fragile CSS selectors
await page.click('.btn-primary')

// ✅ Good - user-facing locators
await page.getByRole('button', { name: 'Place Bet' }).click()
await page.getByTestId('bet-amount-input').fill('0.0001')
await page.getByLabel('Select heads').click()
```

Priority order for locators:
1. `getByRole()` - semantic HTML roles
2. `getByLabel()` - form elements with labels
3. `getByPlaceholder()` - input placeholders
4. `getByText()` - visible text content
5. `getByTestId()` - explicit test IDs
6. CSS/XPath selectors - last resort

### 4. Avoid Hard-Coded Waits
```typescript
// ❌ Bad - arbitrary waits
await page.waitForTimeout(5000)

// ✅ Good - wait for specific conditions
await expect(page.getByText('Balance:')).toBeVisible()
await page.waitForLoadState('networkidle')
await expect(playButton).toBeEnabled()
```

### 5. Use Web-First Assertions
```typescript
// Auto-waiting assertions that retry
await expect(page.getByRole('button', { name: 'Place Bet' })).toBeVisible()
await expect(page.getByText('Transaction confirmed')).toBeVisible({ timeout: 30000 })
```

## Synpress & MetaMask Best Practices

### 1. Wallet Setup
- Use `defineWalletSetup` in `test/wallet-setup/*.setup.ts`
- Cache wallet state for faster test execution
- Add required networks in setup, not in tests

```typescript
const basicSetup = defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD)
  await metamask.importWallet(SEED_PHRASE)
  
  // Add and switch to required network
  await metamask.addNetwork({
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    chainId: 8453,
    symbol: "ETH",
    blockExplorerUrl: "https://basescan.org"
  })
  await metamask.switchNetwork("Base")
})
```

### 2. Transaction Handling
```typescript
// Confirm transaction
await metamask.confirmTransaction()

// Wait for transaction to be mined
await expect(page.getByText('Transaction confirmed')).toBeVisible({ timeout: 30000 })
```

### 3. Balance Verification
```typescript
// Check balance before bet
const initialBalance = await getBalance(page)

// Place bet and wait for result
await placeBet(page, '0.0001')

// Verify balance changed
const finalBalance = await getBalance(page)
expect(finalBalance).not.toBe(initialBalance)
```

## BetSwirl-Specific Best Practices

### 1. Game State Management
- Always check wallet connection state first
- Verify correct network before testing
- Handle game-specific UI states (loading, rolling, results)

### 2. Button State Handling
```typescript
// The Place Bet button has many states
const playButtonStates = [
  "Place Bet",           // Ready to place bet
  "Connect Wallet",      // Wallet not connected
  "Switch chain",        // Wrong network
  "Approve Token",       // ERC20 approval needed
  "Placing Bet...",      // Transaction being submitted
  "Loading Bet...",      // Waiting for tx confirmation
  "Bet rolling...",      // Bet being resolved on-chain
  "Insufficient balance", // Not enough funds
  "Make your selection", // No game selection made
  "Loading...",          // Initial loading
  "Game paused",         // Game is paused
  "Error, try again"     // Error occurred
]

// Wait for correct state
await expect(playButton).toHaveText("Place Bet")
```

### 3. Dialog and Modal Handling
```typescript
// Close bet history if open
const historyCloseButton = page.locator('button[aria-label="Close"]')
if (await historyCloseButton.isVisible({ timeout: 2000 })) {
  await historyCloseButton.click()
}

// Handle result modals
const resultModal = page.locator('[role="dialog"]').filter({ hasText: /You (won|lost)/i })
if (await resultModal.isVisible()) {
  // Process result
  await page.getByRole('button', { name: 'Close' }).click()
}
```

### 4. Error Handling
```typescript
try {
  await metamask.confirmTransaction()
} catch (error) {
  // Take screenshot for debugging
  await page.screenshot({ path: 'error-state.png' })
  throw error
}
```

### 5. Test Data Management
- Use environment variables for sensitive data
- Store test credentials in `.secrets` file (git-ignored)
- Use consistent test amounts (e.g., 0.0001 ETH)

### 6. Page Object Pattern (Optional)
For complex tests, consider using Page Objects:

```typescript
class CoinTossPage {
  constructor(private page: Page) {}
  
  async selectHeads() {
    await this.page.getByLabel('Select heads').click()
  }
  
  async setBetAmount(amount: string) {
    await this.page.getByTestId('bet-amount-input').fill(amount)
  }
  
  async placeBet() {
    await this.page.getByRole('button', { name: 'Place Bet' }).click()
  }
}
```

## Running Tests

### Development
```bash
# Clear cache if wallet setup changed
pnpm test:clear-cache

# Setup wallet (only needed once or after cache clear)
pnpm test:e2e-setup

# Run specific game test
pnpm test:cointoss
pnpm test:dice
pnpm test:roulette
pnpm test:keno
```

### CI/CD
```bash
# Run all tests in headless mode
HEADLESS=true pnpm test:e2e

# Run with detailed reporter
pnpm test:e2e --reporter=list,html
```

## Debugging

### 1. Use Playwright Inspector
```bash
PWDEBUG=1 pnpm test:cointoss
```

### 2. Take Screenshots on Failure
```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    await page.screenshot({ path: `failure-${Date.now()}.png` })
  }
})
```

### 3. Use Trace Viewer
```bash
# Show trace for failed tests
pnpm exec playwright show-trace test-results/*/trace.zip
```

## Common Pitfalls to Avoid

1. **Don't use index-based button selection** - UI might change
2. **Don't hardcode wait times** - Use proper wait conditions
3. **Don't test third-party services** - Focus on your app
4. **Don't share state between tests** - Keep tests isolated
5. **Don't ignore flaky tests** - Fix the root cause
6. **Don't use production wallets** - Use test accounts only
7. **Don't commit sensitive data** - Use environment variables