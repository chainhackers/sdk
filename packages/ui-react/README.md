# BetSwirl UI - React Casino Game Components

This is a **game widget library** for BetSwirl protocol casino games built with React + TypeScript + Vite.

## Available Games

* 🪙 **CoinToss** - Classic heads/tails game with animated coin flip
* 🎲 **Dice** - Roll the dice with customizable win conditions
* 🎰 **Roulette** - European roulette with single zero

## Quick Start

🚀 **Build a Web3 casino with just 20 lines of React code!**

* 📖 [React Integration Guide](https://github.com/chainhackers/sdk/blob/main/packages/ui-react/docs/react-guide.md) - Step-by-step tutorial
* 🎮 [Live Demo](https://betswirl-ui-react-demo.vercel.app/) - See it in action ([source code](https://github.com/chainhackers/betswirl-ui-react-demo))
* 🎨 [Storybook](http://demo.betswirl-sdk.chainhackers.xyz/) - Explore all components interactively


## Development Setup

The project uses:
- **React 19** + **TypeScript** for component development
- **Vite** for fast development and building
- **Biome** for linting and code formatting (replaces ESLint)
- **Storybook** for component development and testing
- **Tailwind CSS 4** for styling

## Code Quality

This project uses **Biome** for linting and formatting:

```bash
# Check code quality
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format code
pnpm format
```

Configuration is in `biome.json` and extends the root workspace configuration.

## Deploy

```shell
setfacl -R -m u:dev-components:rwx /var/www/betswirl-sdk/
```

1. Navigate to the ui-react folder:
```shell
cd packages/ui-react
```

2. Install dependencies (ignore workspace):
```shell
pnpm install
```

Start Storybook:
```shell
pnpm storybook
```

Start development server:
```bash
pnpm dev
```

Open in browser:
```
Storybook: http://localhost:6006/
Dev server: http://localhost:5173/
```

## Testing

### E2E Test Setup

Before running E2E tests, you need to set up a test wallet:

1. **Create a test wallet**: Generate a new wallet mnemonic (12-24 words) using MetaMask or any wallet generator. **Never use your main wallet for testing!**

2. **Configure the test wallet**: Create a `.secrets` file in the SDK project root with your test wallet mnemonic

3. **Get your test wallet address**:
   ```bash
   # Install Foundry (one time only)
   curl -L https://foundry.paradigm.xyz | bash
   source ~/.zshenv  # or source ~/.bashrc for bash users
   foundryup
   
   # Get wallet address from seed phrase
   cd path/to/sdk
   SEED=$(grep SEED_PHRASE .secrets | cut -d"'" -f2)
   cast wallet address --mnemonic "$SEED"
   ```

4. **Fund your test wallet** with small amounts for testing:
   - **Base**: Send 0.0003 ETH and 10 DEGEN tokens
   - **Polygon**: Send 0.5 POL (MATIC)
   
   Check balances at: `https://basescan.org` or `https://polygonscan.com`

### Run e2e tests:

Start development server (if not already running):
```bash
pnpm dev
```

Run tests:
```bash
pnpm test:e2e
```

On the first run, installing Chromium and MetaMask wallet setup may take some time.

### Testing Best Practices

#### ARIA Roles for E2E Testing

We use ARIA roles (`role="listbox"` and `role="option"`) on our custom token selector components primarily to make E2E tests more reliable and maintainable:

- **Stable selectors**: ARIA roles provide semantic selectors that won't break when CSS classes change
- **Easy token detection**: Tests can reliably find and interact with token options using `[role="option"]`
- **Better than class names**: More resilient than `.token-option` or other implementation-specific selectors

Example in tests:
```typescript
// Find all available tokens
const tokens = await page.locator('[role="option"]').allTextContents()

// Select a specific token
await page.locator('[role="option"][aria-selected="false"]').first().click()
```

**Note on linter warnings**: Biome suggests using native `<select>` elements, but our custom components need features that native elements can't provide (token icons, balance displays, custom styling). The biome-ignore comments are intentional.

### Building and Publishing
- `pnpm build` - Build library for production
- `pnpm prepublishOnly` - Automatically runs build before publishing
