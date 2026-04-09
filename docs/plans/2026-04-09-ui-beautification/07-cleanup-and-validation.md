# Phase 7: Cleanup & Validation

## Scope

Final cleanup, remove temporary code, fix any remaining warnings, run full validation,
move plan files, and commit.

## Cleanup & validation

### 1. Grep for temporary code

Search the git diff for:

- `TODO` comments that shouldn't persist
- Debug `console.log` statements
- Commented-out code blocks
- Any remaining raw hex values in component files (should all be semantic tokens now)
- Any remaining hardcoded Tailwind colors (`bg-blue-*`, `bg-purple-*`, `bg-gray-*`,
  `bg-green-*`, `bg-orange-*`, `bg-yellow-*`, `bg-pink-*`) in component files

Remove anything that shouldn't ship.

### 2. Verify dark mode

Check all updated components in both light and dark mode. Specific things to verify:

- Flame colors (`bg-flame`, `text-flame`) are legible on dark backgrounds
- Warmth colors (`bg-warmth`, `text-warmth`) are legible on dark backgrounds
- Primary on dark (`#c4c0ff`) has sufficient contrast against dark card/background
- Ghost borders (`border-border/15`) are visible enough in dark mode (may need `dark:border-border/30`)
- Ambient shadows aren't too aggressive in dark mode

### 3. Run full validation

```bash
pnpm turbo validate
```

This runs check, test, and build. Fix all errors and warnings.

### 4. Format check

```bash
pnpm format:check
```

If issues, run `pnpm format` to fix.

## Plan cleanup

### 1. Summary

Create `docs/plans/2026-04-09-ui-beautification/summary.md` with a summary of completed work.

### 2. Move plan

Move the plan directory to `docs/plans-done/`:

```bash
mv docs/plans/2026-04-09-ui-beautification docs/plans-done/2026-04-09-ui-beautification
```

## Commit

STOP FOR HUMAN REVIEW before committing.

Proposed commit message format:

```
feat(ui): implement Kinetic Professional design system

- Replace shadcn zinc palette with deep-purple primary + flame/warmth tokens
- Add light and dark mode color palettes with purple-tinted surfaces
- Load Inter from Google Fonts, add editorial typography scale
- Bump base radius to 0.75rem
- Add gradient primary button and new 'flame' button variant
- Restyle Card (borderless), Input (ghost border), Badge (flame/warmth variants)
- Build SkillFlameMeter and SkillProficiencyCard components (Storybook-only)
- Create ColorPalette documentation story
- Update all domain components to use semantic tokens
- Apply tonal layering and spacing to CreateJobPage, JobDetailPage
```
