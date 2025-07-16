# BetSwirl UI - React Casino Game Components

This is a **game widget library** for BetSwirl protocol casino games built with React + TypeScript + Vite.

## Available Games

* 🪙 **CoinToss** - Classic heads/tails game with animated coin flip
* 🎲 **Dice** - Roll the dice with customizable win conditions
* 🎰 **Roulette** - European roulette with single zero
* 🎯 **Keno** - Pick your lucky numbers and win big

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

## Development Setup

1. Clone the repository and install dependencies from the **root directory**:
```shell
git clone https://github.com/chainhackers/sdk.git
cd sdk
pnpm install
```

2. Build all packages:
```shell
pnpm build
```

3. Navigate to the ui-react package:
```shell
cd packages/ui-react
```

4. Start development server:
```bash
pnpm dev
```

5. Or start Storybook:
```shell
pnpm storybook
```

Open in browser:
```
Storybook: http://localhost:6006/
Dev server: http://localhost:5173/
```

## Testing

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

### Building and Publishing
- `pnpm build` - Build library for production
- `pnpm prepublishOnly` - Automatically runs build before publishing
