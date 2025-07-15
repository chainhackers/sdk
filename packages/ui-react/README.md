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

🪐 **Create a Farcaster Frame with BetSwirl game**

* 📖 [Farcaster Integration Guide](../../examples/farcaster-frame/betswirl-farcaster-guide.md)

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
