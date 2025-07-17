# BetSwirl UI React - Development Guide

This document is for developers working on the BetSwirl UI React library itself, not for users of the library.

## Development Setup

### Prerequisites

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

### Development Commands

#### Start Development Server
```bash
pnpm dev
```
Opens: http://localhost:5173/

#### Start Storybook
```shell
pnpm storybook
```
Opens: http://localhost:6006/

#### Code Quality
```bash
# Check code quality
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format code
pnpm format
```

Configuration is in root `biome.json` and applies to the entire monorepo.

#### Biome Configuration

This project uses **Biome** for code formatting and linting instead of ESLint/Prettier:

**Why Biome?**
- **Faster**: Written in Rust, 20x faster than ESLint
- **All-in-one**: Combines linting, formatting, and import sorting
- **Zero config**: Works out of the box with sensible defaults

**Configuration structure:**
```
├── biome.json (root workspace config for entire monorepo)
```

**Key settings:**
- **Formatting**: 2 spaces, 100 char line width, double quotes
- **Linting**: Recommended rules + custom project rules
- **Exclusions**: Ignores build artifacts (`dist/`, `.cache-synpress/`, `playwright-report/`, `node_modules/`, `.turbo/`)

**Common issues:**
- If Biome hangs: Check if you have large generated files not excluded in root biome.json
- If formatting differs: Run `pnpm format` to auto-fix

## Testing

### E2E Tests
Start development server (if not already running):
```bash
pnpm dev
```

Run tests:
```bash
pnpm test:e2e
```

On the first run, installing Chromium and MetaMask wallet setup may take some time.

## Building and Publishing

### Build Library
```bash
pnpm build
```

### Publishing
```bash
pnpm prepublishOnly  # Automatically runs build before publishing
```

## Deployment

### Storybook Deployment

The Storybook for this library is deployed at: http://demo.betswirl-sdk.chainhackers.xyz/

#### Server Setup
Before deploying, ensure proper permissions are set on the server:

```shell
setfacl -R -m u:dev-components:rwx /var/www/betswirl-sdk/
```

This command:
- Sets ACL (Access Control List) permissions
- Grants read/write/execute permissions to the `dev-components` user
- Applies to `/var/www/betswirl-sdk/` directory recursively

#### Manual Deployment Process
1. Navigate to the ui-react folder:
```shell
cd packages/ui-react
```

2. Install dependencies (ignore workspace):
```shell
pnpm install
```

3. Build and deploy Storybook:
```shell
pnpm storybook:build
# Copy build output to server
```

**Note**: This process should be automated via CI/CD. The manual steps are for emergency deployments only.

## Architecture

The project uses:
- **React 19** + **TypeScript** for component development
- **Vite** for fast development and building
- **Biome** for linting and code formatting (replaces ESLint)
- **Storybook** for component development and testing
- **Tailwind CSS 4** for styling

