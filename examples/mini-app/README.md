# BetSwirl UI - React Casino Game Components

This is a **game widget library** for BetSwirl protocol casino games built with React + TypeScript + Vite.

## Available Games

* 🪙 **CoinToss** - Classic heads/tails game with animated coin flip
* 🎲 **Dice** - Roll the dice with customizable win conditions
* 🎰 **Roulette** - European roulette with single zero

## Quick Start

🚀 **Build a Web3 casino with just 20 lines of React code!**

* 📖 [React Integration Guide](https://github.com/chainhackers/sdk/blob/main/examples/mini-app/docs/react-guide.md) - Step-by-step tutorial
* 🎮 [Live Demo](https://github.com/chainhackers/betswirl-ui-react-demo) - See what you can build
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

1. Navigate to the mini-app folder:
```shell
cd examples/mini-app
```

2. Install dependencies (ignore workspace):
```shell
pnpm install --ignore-workspace
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

### Building and Publishing
- `pnpm build` - Build library for production
- `pnpm prepublishOnly` - Automatically runs build before publishing
