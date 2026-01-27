# Phase 4: Configure Tool-Specific Tasks with Caching, Inputs, and Outputs

## Scope of Phase

Add configuration for all tool-specific tasks in `turbo.jsonc` with appropriate caching settings, input files, output directories, and environment variables. This enables Turbo to properly cache and invalidate tasks.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

Add tool-specific task configurations following the reference structure:

### Build Tasks

```jsonc
"build:svelte": {
  "dependsOn": ["^build"],
  "inputs": ["$TURBO_DEFAULT$", ".env*"],
  "outputs": [".svelte-kit/**", ".vercel/**", "build/**", "dist/**"],
  "env": ["NODE_ENV"],
  "cache": true
},
"build:storybook": {
  "inputs": ["src/**", ".storybook/**", "package.json"],
  "outputs": ["storybook-static/**"],
  "cache": true
}
```

### Check Tasks

```jsonc
"check:prettier": {
  "inputs": ["**/*.{json,jsonc,md,yml,yaml,ts,svelte,css}", ".prettierrc", ".prettierignore"],
  "cache": true
},
"check:eslint": {
  "inputs": ["src/**", ".eslintrc*", "eslint.config.*"],
  "cache": true
},
"check:typescript": {
  "inputs": ["src/**", "tsconfig.json"],
  "cache": true
},
"check:svelte": {
  "inputs": ["src/**", "tsconfig.json", "svelte.config.js"],
  "cache": true
}
```

### Fix Tasks

```jsonc
"fix:prettier": {
  "inputs": ["**/*.{json,jsonc,md,yml,yaml,ts,svelte,css}", ".prettierrc", ".prettierignore"],
  "outputs": ["**/*.{json,jsonc,md,yml,yaml,ts,svelte,css}"],
  "cache": true
},
"fix:eslint": {
  "inputs": ["src/**", ".eslintrc*", "eslint.config.*"],
  "outputs": ["src/**"],
  "cache": true
}
```

### Test Tasks

```jsonc
"test:vitest": {
  "inputs": ["src/**", "vitest.config.ts", "vitest.setup.ts", "vitest.shims.d.ts", "tsconfig.json"],
  "outputs": ["test-results/**", "coverage/**"],
  "env": ["CI"],
  "cache": true
},
"e2e:playwright": {
  "dependsOn": ["build"],
  "inputs": ["e2e/**", "src/**", "playwright.config.ts"],
  "outputs": ["test-results/**"],
  "env": ["CI"],
  "cache": true
}
```

**Notes**:

- `$TURBO_DEFAULT$` includes common source files (src/\*\*, etc.)
- For `e2e:playwright`, it depends on `build` since e2e tests need the built app
- Adjust input/output patterns based on actual project structure
- Environment variables that affect task output should be listed in `env`

## Validate

Run the following commands to validate:

```bash
# Test that tasks can be cached
pnpm turbo run build
pnpm turbo run check
pnpm turbo run test

# Verify caching works by running again (should show cache hits)
pnpm turbo run build
pnpm turbo run check
pnpm turbo run test

# Test fix tasks
pnpm turbo run fix

# Test e2e (may take longer)
pnpm turbo run e2e
```

All tasks should execute successfully. The second run should show cache hits for tasks that didn't have input changes.
