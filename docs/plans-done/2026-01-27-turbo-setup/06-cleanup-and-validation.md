# Phase 6: Cleanup & Validation

## Cleanup & validation

Grep the git diff for any temporary code, TODOs, debug prints, etc. Remove them.

```bash
# Check for TODOs, FIXMEs, or temporary code
git diff | grep -i "TODO\|FIXME\|TEMP\|DEBUG" || echo "No temporary code found"
```

Specify the exact validation command to run:

```bash
# Final validation - all tasks should work
pnpm turbo run build
pnpm turbo run check
pnpm turbo run fix
pnpm turbo run test
pnpm turbo run e2e

# Verify no errors or warnings
pnpm turbo run build --dry-run
pnpm turbo run check --dry-run
```

Fix all warnings, errors, and formatting issues.

## Plan cleanup

Add a summary of the completed work to `docs/plans/2026-01-27-turbo-setup/summary.md`.

Move the plan files to the `docs/plans-done/` directory.

## Commit

Once the plan is complete, and everything compiles and passes tests, commit the changes with a message following the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
chore(turbo): set up Turborepo with category tasks

- Install turbo as dev dependency
- Create turbo.jsonc with category tasks (build, check, fix, test, e2e)
- Update package.json scripts to tool-specific naming convention
- Configure caching, inputs, and outputs for all tasks
- Add dev and storybook tasks with appropriate cache settings
```
