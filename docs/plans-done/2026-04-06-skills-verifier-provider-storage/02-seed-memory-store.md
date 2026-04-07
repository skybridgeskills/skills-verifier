# Phase 2: Seed memory store

## Scope of phase

When the app uses **`MemoryDatabase`**, populate it with a **small deterministic dataset** (e.g. one or two jobs, optionally job applications) so local dev and demos are not empty. Provide a **test escape hatch** so Vitest suites that need an empty store are not broken.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a `TODO` comment so we can find it later.

## Implementation Details

**Design constraint (from [`00-design.md`](./00-design.md)):** Run seeding **after** `AppContext` exists, using **`runInContext(ctx, () => …)`** so `createJobQuery` / `createJobAppQuery` see the same `idService`, `timeService`, and `database` as request handlers.

**New file (suggested)**

- `src/lib/server/core/storage/seed-dev-data.ts` (or `src/lib/server/seed-dev-data.ts`) exporting `async function seedDevDataIfNeeded(ctx: AppContext): Promise<void>`.

**Logic**

1. If `ctx.database` is not memory (`isMemoryDatabase`), return immediately.
2. If seeding is disabled (`process.env.SEED_MEMORY_DATABASE === 'false'` or `no` or `0`), return immediately.
3. Optionally: skip if maps are already non-empty (idempotent dev restarts / HMR) — or always upsert by external id; document choice.
4. Inside `runInContext(ctx, async () => { … })` from `hooks.server.ts` `init` **after** `serverAppContext` is assigned:
   - Call `await createJobQuery({ … })` with realistic minimal fields (`frameworks: []`, `skills` with at least one item if schema requires, etc.).
   - Optionally `await createJobAppQuery({ … })` referencing the job id from the created job.

**Test context**

- Update [`src/lib/server/test-app-context.ts`](../../../src/lib/server/test-app-context.ts) so tests do **not** trigger seeding:
  - Either set `SEED_MEMORY_DATABASE=false` in test setup before `TestAppContext()`, or use a dedicated `MemoryDatabase` constructor path that never seeds, or build test providers without calling `seedDevDataIfNeeded`.

**Env / docs**

- Add `SEED_MEMORY_DATABASE` to [`.env.example`](../../../.env.example) with a one-line description (defaults to true in dev).
- Mention in [`docs/design/open-questions.md`](../../design/open-questions.md) or README only if it helps contributors; avoid duplicating long prose.

**Tests to add or extend**

- One test that with `SKIP_MEMORY_SEED` unset and a **thrown-together minimal AppContext** is heavy; prefer testing `seedDevDataIfNeeded` in isolation with `runInContext` + memory DB, asserting map sizes or listing query results.
- Ensure existing [`storage-queries.test.ts`](../../../src/lib/server/core/storage/storage-queries.test.ts) still passes (empty DB at test start).

## Validate

```bash
pnpm exec svelte-kit sync && pnpm exec svelte-check --tsconfig ./tsconfig.json
pnpm exec vitest run
```

Manual: `pnpm dev` (seeding on by default), confirm seeded jobs appear wherever listing exists (after phase 4) or via a temporary log; with `SEED_MEMORY_DATABASE=false`, confirm no seed side effects if you add a quick diagnostic route (optional).
