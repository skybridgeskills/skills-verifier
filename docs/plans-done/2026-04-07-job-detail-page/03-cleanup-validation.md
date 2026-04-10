# Phase 3: Cleanup & Validation

## Scope of phase

Remove dead code, verify everything compiles and passes tests, move plan files,
and commit.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Style conventions

- **Import order**: external → `$lib/` → relative.
- Check all touched files comply with conventions.

## Cleanup & validation

### Dead code check

Grep the git diff for:

- TODO / FIXME / HACK comments that should not ship
- Debug `console.log` statements
- Unused imports
- Commented-out code

### Validate

```sh
pnpm turbo validate
```

This runs check, test, and build. Fix any errors, warnings, or formatting
issues.

### Storybook verification

Run Storybook and verify all stories for:

- `SkillItem`
- `SkillSearchResultItem`
- `SelectedSkillsColumn`
- `JobDetailPage`

### Plan cleanup

1. Add a summary of completed work to `docs/plans/2026-04-07-job-detail-page/summary.md`.
2. Move plan files to `docs/plans-done/2026-04-07-job-detail-page/`.

### Commit

STOP FOR HUMAN REVIEW before committing.

Proposed commit message format:

```
feat(ui): add job detail page and extract SkillItem component

- Add read-only /jobs/[id] detail page with server load and 404 handling
- Create JobDetailPage presentation component with Storybook stories
- Link job titles in the list page to the detail view
- Refactor SkillItem as bare presentation component for composition
- Update SkillSearchResultItem and SelectedSkillsColumn to compose SkillItem
```
