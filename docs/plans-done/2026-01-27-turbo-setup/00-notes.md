# Turbo Setup Plan - Notes

## Scope of Work

Set up Turborepo (Turbo) for the skills-verifier project with the following category tasks:

- `build` - Build the application (depends on `build:svelte`)
- `fix` - Auto-fix linting and formatting issues
- `check` - Run all checks (prettier, eslint, typescript, svelte)
- `test` - Run unit tests
- `e2e` - Run end-to-end tests

The structure should follow the pattern from the reference monorepo where:

- Top-level category tasks (like `test`, `check`, `fix`, `build`) are defined in `turbo.jsonc`
- These category tasks depend on tool-specific tasks (like `test:vitest`, `check:eslint`, `fix:prettier`)
- Tool-specific tasks are defined as scripts in `package.json`
- When running `turbo test`, Turbo will execute the `test:vitest` script from `package.json`

## Current State

### Package.json Scripts

Current scripts in `package.json`:

- `dev` - vite dev
- `build` - vite build
- `preview` - vite preview
- `prepare` - svelte-kit sync
- `check` - svelte-kit sync && svelte-check (TypeScript/Svelte checking)
- `check:watch` - watch mode for svelte-check
- `lint` - prettier --check . && eslint . (runs both prettier and eslint checks)
- `format` - prettier --write . (auto-fixes prettier)
- `test:unit` - vitest
- `test` - runs test:unit and test:e2e sequentially
- `test:e2e` - playwright test
- `storybook` - storybook dev
- `build-storybook` - storybook build

### Tooling

- ESLint configured via `eslint.config.js` (flat config format)
- Prettier configured via `.prettierrc`
- TypeScript checking via `svelte-check`
- Vitest for unit tests
- Playwright for e2e tests
- Storybook for component development

### Project Structure

- Single package (not a monorepo yet, but has `pnpm-workspace.yaml`)
- SvelteKit application
- Uses pnpm as package manager

## Questions

### Q1: Test Task Organization ✅

**Context**: Currently `test` runs both `test:unit` and `test:e2e` sequentially. The reference structure separates these into `test` (for unit tests) and `e2e` (for e2e tests).

**Question**: Should we:

- Option A: Keep `test` as a category that runs both unit and e2e tests (simpler, matches current behavior)
- Option B: Separate into `test` (unit tests only) and `e2e` (e2e tests only) to match the reference structure

**Answer**: Option B - Separate them. `test` will be for unit tests only, `e2e` will be for e2e tests only.

### Q2: Check Task Breakdown ✅

**Context**: Currently `lint` runs both prettier check and eslint. The reference structure breaks these into separate tasks: `check:prettier`, `check:eslint`, `check:typescript`, `check:svelte`.

**Answer**: Follow the reference structure exactly. Break down into:

- `check:prettier` - prettier --check
- `check:eslint` - eslint .
- `check:typescript` - svelte-check (or separate TypeScript check)
- `check:svelte` - svelte-check (or separate Svelte check)

Note: Since `svelte-check` handles both TypeScript and Svelte checking, we'll need to determine if we can separate them or if they share the same script.

### Q3: Fix Task Organization ✅

**Context**: Currently `format` runs prettier --write. The reference has `fix:prettier` and `fix:eslint`.

**Answer**: Yes to all:

- Rename `format` to `fix:prettier`
- Add `fix:eslint` for eslint --fix
- Create a `fix` category task that depends on both

### Q4: Build Task ✅

**Context**: Currently `build` is a simple vite build script.

**Answer**: Make `build` a category task in turbo.jsonc that depends on `build:svelte`. Rename the current `build` script in package.json to `build:svelte`.

### Q5: Dev and Preview Tasks ✅

**Context**: `dev` and `preview` are development tasks that shouldn't be cached.

**Answer**: Yes, add `dev` to turbo.jsonc with `cache: false` and `persistent: true`. `preview` can also be added with `cache: false`.

### Q6: Storybook Tasks ✅

**Context**: `storybook` and `build-storybook` are Storybook-specific tasks.

**Answer**: Rename to follow the category:tool pattern:

- `storybook` → `dev:storybook` (for development)
- `build-storybook` → `build:storybook` (for building)
  Add both to turbo.jsonc. `dev:storybook` should have `cache: false` and `persistent: true`.

### Q7: Root Tasks ✅

**Context**: The reference has root-level tasks prefixed with `//#` for things like `//#check`, `//#fix`, etc. These are tasks that run ONLY at the monorepo root (like checking lockfiles, branch names) and NOT in packages.

**Answer**: Skip root-level tasks (`//#`) for this single-package setup. In a single package, there's no distinction between root and package tasks - everything runs in the single package. Regular tasks (like `test`, `build`, `check`) will be found in package.json automatically. We can add root tasks later if/when this becomes a monorepo.

### Q8: Global Environment Variables ✅

**Context**: The reference defines `globalEnv` in turbo.jsonc.

**Answer**: Start with `CI` and `NODE_ENV`. We can add more as needed.
