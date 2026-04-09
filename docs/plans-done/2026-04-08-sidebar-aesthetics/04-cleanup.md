# Phase 4: Cleanup & Validation

## Scope

Final pass: remove temporary code, fix warnings, validate everything compiles and passes tests.

## Cleanup

1. **Grep the diff** for TODOs, `console.log`, debug prints, commented-out code:

   ```bash
   git diff HEAD --unified=0 | grep -E '^\+.*(TODO|console\.|debugger|FIXME)' || echo "Clean"
   ```

2. **Remove unused imports** — check each modified file for imports that are no longer referenced after the refactor (e.g., `QuickPicks` import in `CreateJobPage` if fully removed, `handleToggleQuickPick` handler, any unused type imports).

3. **Check file sizes** — if SkillSearch.svelte has grown significantly past 321 lines, consider whether any helpers can be extracted. The pick-filtering logic is a candidate if needed.

## Validate

```bash
cd /Users/notto/Projects/skybridgeskills/skills-verifier
pnpm turbo check
pnpm turbo test
```

Fix all errors and warnings before proceeding.

## Plan Cleanup

1. Add a summary of completed work to `docs/plans/2026-04-08-sidebar-aesthetics/summary.md`
2. Move the plan directory to `docs/plans-done/2026-04-08-sidebar-aesthetics/`

## Commit

STOP FOR HUMAN REVIEW before committing.

Proposed format:

```
feat(ui): improve CreateJobPage sidebar layout and quick pick UX

- Move sidebar breakpoint from @lg to @5xl (desktop-only)
- Merge two sidebar cards into single styled panel
- Integrate quick picks into SkillSearch empty state, filtered by mode
- Route container/framework quick pick clicks to drill-down view
- Add fluid prop to ResponsivePreview for Storybook
- Widen sidebar from 340px to 400px
```
