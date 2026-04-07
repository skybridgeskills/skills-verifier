# Design: provider lifecycle, memory storage, seeding, job UI

## Scope of work

- **Q4**: Build **`AppContext` once at server startup**; reuse that instance for every request inside `runInContext` (no per-request provider chain, no `Lazy` unless we discover a need).
- **Q3**: **Seed** sample jobs (and optionally job applications) whenever the process uses **`MemoryDatabase`**, with a **test escape hatch** so isolated tests can use an empty store.
- **Q1**: Storage remains **memory-only** in the factory; Dynamo implementations stay in query modules for a future factory branch (see [`docs/design/open-questions.md`](../../design/open-questions.md)).
- **Q2 + UI**: **`frameworks[]` stays optional metadata**; job creation must **not require** a selected framework. Evolve create-job UI toward **skills-first** while allowing empty or future denormalized `frameworks` on save.

Decisions are recorded in [`00-notes.md`](./00-notes.md) (Resolved answers).

## File structure

```
src/
├── hooks.server.ts                    # UPDATE: export init; build/store AppContext once; handle uses it
├── lib/server/
│   ├── dev-app-context.ts             # UPDATE (if needed): keep Providers chain; may export sync builder
│   ├── test-app-context.ts            # UPDATE: unseeded MemoryDatabase (or flag) for tests
│   ├── app-context.ts                 # (unchanged contract)
│   └── core/storage/
│       ├── memory-database.ts         # UPDATE: optional seed hook or delegate to seeder
│       ├── seed-memory-database.ts    # NEW: apply fixed demo jobs/apps to a MemoryDatabase
│       └── storage-database-factory.ts # UPDATE: call seeder when returning MemoryDatabase (respect skip flag)
├── routes/
│   ├── jobs/create/
│   │   +page.server.ts                # NEW: load/action for createJobQuery (+ optional defaults)
│   │   +page.svelte                   # UPDATE: wire form to action or pass data from server
│   └── jobs/                          # NEW (optional phase): list route +page.server.ts
└── lib/pages/
    └── CreateJobPage.svelte           # UPDATE: skills-first validation; optional frameworks; submit via server
```

Supporting edits may touch [`src/lib/server/domain/job/`](../../../src/lib/server/domain/job/) (Zod defaults for optional `frameworks`), client types in [`src/lib/types/job-profile.ts`](../../../src/lib/types/job-profile.ts), and tests under [`src/lib/server/core/storage/storage-queries.test.ts`](../../../src/lib/server/core/storage/storage-queries.test.ts) (explicit unseeded DB or env).

## Conceptual architecture

```
┌─────────────────────────────────────────────────────────────┐
│ SvelteKit server startup (init)                              │
│   devAppProviders() → AppContext (single instance)             │
│   holds: time, id, frameworkClient, database (Memory + seed) │
└────────────────────────────┬────────────────────────────────┘
                             │ same reference each request
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ handle({ event, resolve })                                   │
│   return runInContext(appContextSingleton, () => resolve())  │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ Routes / defineQuery / services                               │
│   appContext().database → shared MemoryDatabase (seeded)     │
└─────────────────────────────────────────────────────────────┘

Tests: TestAppContext() builds MemoryDatabase with SEED skipped → empty maps unless test seeds itself.
```

**Seeding:** After `new MemoryDatabase()`, if seeding is enabled, `seedMemoryDatabase(db)` inserts deterministic IDs (using real or fake id/time from context is tricky at factory level — prefer seeding **inside** the provider that already has `idService`/`timeService`, e.g. extend `StorageDatabaseCtx` or a small `seedIfMemory(db, ctx)` run once right after `Providers()` resolves, so rows get valid `id`/`createdAt`.)

**Alternative (simpler):** Seed in `init` **after** `AppContext` exists: call a function that uses `appContext()` — requires first `runInContext` during init or pass `ctx` into `seedMemoryDatabase(ctx)`. Prefer **`seedDevData(ctx: AppContext)`** invoked from `hooks.server.ts` `init` with `runInContext(ctx, () => seed...)` so queries use the same services as runtime.

## Main components and how they interact

| Piece                   | Role                                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`init`**              | Await `DevAppContext()` once; store result in module-level `let appContextSingleton`.                                                                                |
| **`handle`**            | `runInContext(appContextSingleton, () => resolve(event))` — no async rebuild.                                                                                        |
| **`seedDevData(ctx)`**  | Uses `createJobQuery` / `createJobAppQuery` (or direct map mutation only if we avoid circular imports) to populate memory. Using queries keeps row shape consistent. |
| **`TestAppContext`**    | Use `MemoryDatabase` **without** calling `seedDevData`, or set `process.env.SEED_MEMORY_DATABASE='false'` before building factory — document pattern.                |
| **Create job UI**       | Server `actions.default` validates body, calls `createJobQuery` with `frameworks: []` or optional payload; redirect or return updated list.                          |
| **Optional frameworks** | Zod: `frameworks` default `[]`; UI removes “must select framework” gate; skills remain required (or as you define in validation).                                    |

## Proposed phases

Implementation order (for phase files after you confirm):

1. **Startup app context** — `init` + module singleton; `handle` only wraps `runInContext`; verify no double database creation per request.
2. **Seed memory store** — `seedDevData` + env/test bypass; invoke from `init` after context is built.
3. **Persist create job** — `jobs/create/+page.server.ts` action (and minimal load if needed); `CreateJobPage` posts to it; keep skills required, frameworks optional.
4. **List jobs (optional but small)** — route load using `listActiveJobsQuery` for sanity check / navigation.
5. **UI polish for skills-first** — copy, layout, remove framework-first messaging; align `job-profile` types with optional frameworks.
6. **Cleanup & validation** — `pnpm check:typescript`, `pnpm test:vitest`; update plan `summary.md`; move plan to `docs/plans-done/` when work is complete.

---

**Review:** Adjust the file tree or phases in this doc (or in chat); once agreed, we split into `01-…md` … `06-…md` phase files per the plan command.
