# Chainhackers UI - React Casino Game Components

This is a **game widget library** for BetSwirl protocol casino games built with React + TypeScript + Vite.

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

## Running Mini-App from SDK

If you have downloaded the SDK library and want to run the test mini-app:

1. Navigate to the mini-app folder:
```shell
cd examples/mini-app
```

2. Install dependencies (ignore workspace):
```shell
pnpm install --ignore-workspace
```

3. Start Storybook:
```shell
pnpm storybook
```

4. Open in browser:
```
Local: http://localhost:6006/
```
