# BetSwirl UI React - Development Guide

This document is for developers working on the BetSwirl UI React library itself, not for users of the library.

## Architecture

The project uses:
- **React 19** + **TypeScript** for component development
- **Vite** for fast development and building
- **Biome** for linting and code formatting (replaces ESLint)
- **Storybook** for component development and testing
- **Tailwind CSS 4** for styling


## Development Setup

### Prerequisites

```shell
# Clone and setup from the SDK project root directory
git clone https://github.com/BetSwirl/sdk.git
cd sdk
pnpm install
pnpm build:libs         # Build all library packages
cd packages/ui-react    # Navigate to ui-react
```

### Development Commands

```bash
# From packages/ui-react directory:
pnpm dev         # Start development server (http://localhost:5173/)
pnpm storybook   # Start Storybook (http://localhost:6006/)
```

#### Code Quality
```bash
pnpm lint        # Check code quality
pnpm lint:fix    # Auto-fix issues  
pnpm format      # Format code
```

Configuration uses two files:
- Root [`biome.json`](../../../biome.json) - base configuration for entire monorepo
- Package [`biome.json`](../biome.json) - extends root config with ui-react specific settings

#### Biome Configuration

This project uses **Biome** for code formatting and linting.

**Common issues:**
- If Biome hangs: Check if you have large generated files not excluded in root biome.json
- If formatting differs: Run `pnpm format` to auto-fix

## Testing

### E2E Tests
```bash
pnpm dev         # Start development server if not running
pnpm test:e2e    # Run tests
```

On the first run, installing Chromium and MetaMask wallet setup may take some time.

### Testing Best Practices

#### ARIA Roles for E2E Testing

We use ARIA roles (`role="listbox"` and `role="option"`) on our custom token selector components primarily to make E2E tests more reliable and maintainable:

- **Stable selectors**: ARIA roles provide semantic selectors that won't break when CSS classes change
- **Easy token detection**: Tests can reliably find and interact with token options using `[role="option"]`
- **Stable selectors**: Won't break when CSS classes or implementation details change

Example in tests:
```typescript
// Find all available tokens
const tokens = await page.locator('[role="option"]').allTextContents()

// Select a specific token
await page.locator('[role="option"][aria-selected="false"]').first().click()
```

**Note on linter warnings**: Biome suggests using native `<select>` elements, but our custom components need features that native elements can't provide (token icons, balance displays, custom styling). The biome-ignore comments are intentional.


## Building and Publishing

### Build Library
```bash
pnpm build       # Build the library
```

### Release Process

When ready to publish a new version to npm:

```bash
pnpm change:add  # Create changeset
```
- Select `@betswirl/ui-react` (use spacebar)
- Choose version bump type:
  - `patch` (0.1.6 → 0.1.7) - bug fixes
  - `minor` (0.1.6 → 0.2.0) - new features  
  - `major` (0.1.6 → 1.0.0) - breaking changes
- Write description of changes

```bash
pnpm change:version      # Update version
git add .
git commit -m "chore: release @betswirl/ui-react@X.X.X"
pnpm change:publish      # Publish to npm
git push
```

**Result:** Package is published to npm registry and users can install: `npm install @betswirl/ui-react@X.X.X`

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
```shell
cd packages/ui-react
pnpm install             # Install dependencies (ignore workspace)
pnpm storybook:build
# Copy build output to server
```

**Note**: This process should be automated via CI/CD. The manual steps are for emergency deployments only.

