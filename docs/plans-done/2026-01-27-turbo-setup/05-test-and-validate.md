# Phase 5: Test and Validate Setup

## Scope of Phase

Run comprehensive tests to ensure all tasks work correctly, verify caching behavior, and ensure the setup matches the reference structure. Fix any issues that arise.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

1. **Verify all category tasks work**:
   - Run each category task individually
   - Verify they execute their dependencies correctly
   - Check that tool-specific scripts are called

2. **Verify caching**:
   - Run tasks twice to verify cache hits
   - Make a small change to trigger cache invalidation
   - Verify tasks re-run when inputs change

3. **Verify task dependencies**:
   - `e2e` should depend on `build` (verify this works)
   - Category tasks should depend on their tool-specific tasks

4. **Check for any missing configurations**:
   - Compare with reference `turbo.jsonc` structure
   - Ensure all scripts in `package.json` are either:
     - Tool-specific tasks (referenced by turbo.jsonc)
     - Development helpers (like `check:watch`)
     - Special npm scripts (like `prepare`)

5. **Documentation**:
   - Update README if needed to mention Turbo
   - Document how to use the new task structure

## Validate

Run the following comprehensive validation:

```bash
# Test all category tasks
pnpm turbo run build
pnpm turbo run check
pnpm turbo run fix
pnpm turbo run test
pnpm turbo run e2e

# Verify caching (second run should show cache hits)
pnpm turbo run build
pnpm turbo run check
pnpm turbo run test

# Test that changes invalidate cache
echo "// test" >> src/lib/index.ts
pnpm turbo run build  # Should rebuild
pnpm turbo run check  # Should re-check

# Verify dev tasks (should not cache)
pnpm turbo run dev --help 2>&1 | head -1
pnpm turbo run preview --help 2>&1 | head -1
pnpm turbo run dev:storybook --help 2>&1 | head -1

# Clean up test change
git checkout src/lib/index.ts
```

All tasks should work correctly. Category tasks should orchestrate their dependencies, and caching should work as expected.
