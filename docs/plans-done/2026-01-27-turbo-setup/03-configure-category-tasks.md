# Phase 3: Configure Category Tasks in turbo.jsonc

## Scope of Phase

Add the category tasks (`build`, `check`, `fix`, `test`, `e2e`) to `turbo.jsonc` that orchestrate the tool-specific tasks. These are the high-level tasks that users will run.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

Add the following category tasks to `turbo.jsonc`:

### Build Category

```jsonc
"build": {
  "dependsOn": ["build:svelte"]
}
```

### Check Category

```jsonc
"check": {
  "dependsOn": [
    "check:prettier",
    "check:eslint",
    "check:typescript",
    "check:svelte"
  ]
}
```

### Fix Category

```jsonc
"fix": {
  "dependsOn": [
    "fix:prettier",
    "fix:eslint"
  ]
}
```

### Test Category

```jsonc
"test": {
  "dependsOn": ["test:vitest"]
}
```

### E2E Category

```jsonc
"e2e": {
  "dependsOn": ["e2e:playwright"]
}
```

### Dev Tasks

```jsonc
"dev": {
  "cache": false,
  "persistent": true
},
"preview": {
  "cache": false
},
"dev:storybook": {
  "cache": false,
  "persistent": true
}
```

### Build Storybook

```jsonc
"build:storybook": {}
```

Add comments explaining that category tasks should NOT be defined in package.json, following the reference structure.

## Validate

Run the following commands to validate:

```bash
# Test that category tasks can be resolved (dry-run)
pnpm turbo run build --dry-run
pnpm turbo run check --dry-run
pnpm turbo run fix --dry-run
pnpm turbo run test --dry-run
pnpm turbo run e2e --dry-run
```

All commands should show the dependency chain without errors. They may show warnings about missing tool-specific task configurations, which is expected and will be fixed in the next phase.
