# Phase 4: List jobs route

## Scope of phase

Add a **jobs list** page (or extend an existing home flow) that loads **active jobs** via **`listActiveJobsQuery`** in a `load` function, so users can see seeded and newly created jobs without digging into the network tab.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a `TODO` comment so we can find it later.

## Implementation Details

**Routes**

- Add `src/routes/jobs/+page.server.ts` with `load` that runs inside normal request context (no extra `runInContext` needed — `handle` already wraps):
  - `const jobs = await listActiveJobsQuery({});`
  - Return `{ jobs }` (serialize dates if needed; SvelteKit serializes Date to string in JSON — confirm `JobResource` fields are JSON-safe).

- Add `src/routes/jobs/+page.svelte` — simple list UI (title, company, link to detail if you add `[jobId]` later). Keep styling consistent with existing layout/components.

**Navigation**

- Update root redirect in [`src/routes/+page.server.ts`](../../../src/routes/+page.server.ts) if it currently always sends users to `/jobs/create` — e.g. redirect to `/jobs` or add a nav link from create → list.

**Optional**

- `src/routes/jobs/[jobId]/+page.server.ts` for a minimal detail view using `jobByIdQuery` — only if timeboxed in this phase; otherwise defer to a follow-up.

**Tests**

- Optional: load function test with `TestAppContext` + seed or `createJobQuery` then invoke load. Not mandatory if e2e covers it later.

## Validate

```bash
pnpm exec svelte-kit sync && pnpm exec svelte-check --tsconfig ./tsconfig.json
pnpm exec vitest run
```

Manual: open `/jobs`, confirm seeded jobs and newly created jobs appear.
