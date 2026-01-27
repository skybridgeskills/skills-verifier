# Phase 2: Update package.json Scripts to Tool-Specific Naming

## Scope of Phase

Rename and restructure scripts in `package.json` to follow the tool-specific naming convention that matches the tasks defined in `turbo.jsonc`. This includes renaming existing scripts and adding new ones as needed.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

Update `package.json` scripts according to the following mapping:

### Build Tasks

- `build` → `build:svelte` (vite build)
- Keep `build-storybook` → rename to `build:storybook` (storybook build)

### Check Tasks

- Split `lint` into:
  - `check:prettier` - `prettier --check .`
  - `check:eslint` - `eslint .`
- Split `check` into:
  - `check:typescript` - `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --ts-only` (if possible, or just use svelte-check)
  - `check:svelte` - `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json`
- Keep `check:watch` as-is (development helper)

### Fix Tasks

- `format` → `fix:prettier` - `prettier --write .`
- Add `fix:eslint` - `eslint . --fix`

### Test Tasks

- `test:unit` → `test:vitest` - `vitest`
- `test:e2e` → `e2e:playwright` - `playwright test`
- Remove `test` (will be handled by turbo category task)

### Dev Tasks

- Keep `dev` as-is - `vite dev`
- Keep `preview` as-is - `vite preview`
- `storybook` → `dev:storybook` - `storybook dev -p 6006`

### Other Tasks

- Keep `prepare` as-is - `svelte-kit sync || echo ''`

**Note**: For `check:typescript` and `check:svelte`, since `svelte-check` handles both, we may need to use the same command for both or find a way to separate them. Check if `svelte-check` has flags to check only TypeScript or only Svelte. If not, we can use the same script for both tasks.

## Validate

Run the following commands to validate:

```bash
# Verify all scripts exist and are valid
pnpm run build:svelte --help 2>&1 | head -1
pnpm run check:prettier --help 2>&1 | head -1
pnpm run check:eslint --help 2>&1 | head -1
pnpm run fix:prettier --help 2>&1 | head -1
pnpm run fix:eslint --help 2>&1 | head -1
pnpm run test:vitest --help 2>&1 | head -1
pnpm run e2e:playwright --help 2>&1 | head -1
```

All commands should execute without errors (they may show help text or run the actual command, which is fine).
