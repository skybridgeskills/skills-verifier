# Summary: provider lifecycle, memory seeding, job CRUD UI

## Completed

- **Single app context at server startup** — [`src/hooks.server.ts`](../../../src/hooks.server.ts) exports `init` that builds `DevAppContext()` once and runs seeding inside `runInContext`; `handle` reuses that instance per request.
- **Seeded `MemoryDatabase`** — [`src/lib/server/core/storage/seed-dev-data.ts`](../../../src/lib/server/core/storage/seed-dev-data.ts) adds two demo jobs and one job application when the DB is empty; seeding is on by default in dev, opt-out via `SEED_MEMORY_DATABASE=false` (documented in [`.env.example`](../../../.env.example)).
- **Create job via server action** — [`src/routes/jobs/create/+page.server.ts`](../../../src/routes/jobs/create/+page.server.ts) `createJob` action validates with `CreateJobParams` (frameworks default `[]`, skills min 1, status default `active`).
- **Jobs list** — [`src/routes/jobs/+page.server.ts`](../../../src/routes/jobs/+page.server.ts) / [`+page.svelte`](../../../src/routes/jobs/+page.svelte); home redirects to `/jobs`; header links to Jobs + Create job.
- **Skills-first create UI** — [`src/lib/pages/CreateJobPage.svelte`](../../../src/lib/pages/CreateJobPage.svelte) with [`QuickSkillPicks`](../../../src/lib/components/quick-skill-picks/QuickSkillPicks.svelte) and [`sample-skills.ts`](../../../src/lib/config/sample-skills.ts); optional framework section; [`JobProfileForm`](../../../src/lib/components/job-profile-form/JobProfileForm.svelte) `embedded` mode for parent POST form.
- **Domain tweak** — `CreateJobParams.frameworks` defaults to `[]`; `skills` requires at least one item; default `status` `active` for new creates.

## Follow-ups

- Re-enable DynamoDB in [`storage-database-factory`](../../../src/lib/server/core/storage/storage-database-factory.ts) when deploying with persistence.
- Job detail route `[jobId]` and e2e coverage if needed.
- Storybook stories for create flow with `form` prop / enhance behavior (optional).

## Validation run

- `pnpm exec svelte-kit sync && pnpm exec svelte-check --tsconfig ./tsconfig.json`
- `pnpm exec vitest run --project server`
- `pnpm exec eslint .`
