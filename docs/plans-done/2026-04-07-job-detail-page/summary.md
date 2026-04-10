# Job detail page — summary

## Completed

- Added `/jobs/[id]` with `jobByIdQuery` in `+page.server.ts` and 404 when missing.
- Added `JobDetailPage.svelte` (metadata, external ID, apply link, skills via `SkillItem`)
  and Storybook stories.
- Job list: job title links to `/jobs/[id]` with hover underline.
- Replaced interactive `SkillItem` with a bare presentation component (title, subtitle, ctid).
- `SkillSearchResultItem` and `SelectedSkillsColumn` now compose `SkillItem`.
- Export barrel: `src/lib/components/skill-item/index.ts`.

## Validation

- `pnpm run check:eslint`, `pnpm run check:prettier`, `pnpm run check:svelte`
- `pnpm run test:vitest`, `pnpm run test:storybook`, `pnpm run build:svelte`

## Notes

- Storybook / browser vitest require Playwright browsers (`pnpm exec playwright install chromium`) where not already present.
