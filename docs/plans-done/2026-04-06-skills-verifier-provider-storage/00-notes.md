# Plan notes: provider system, storage, UI, seed data

## Scope of work

- Align **provider-based app context** with patterns used in `tenant-home` (lazy init, explicit handle wiring, test/e2e hooks where applicable).
- **Data storage**: in-memory default for local dev; clarify role of DynamoDB (prod vs optional local).
- **Seed data** for a useful empty dev experience (jobs and/or applications).
- **UI / domain**: reconcile **frameworks** (Credential Engine, framework-first job creation) with the direction to **map skills directly onto jobs**—schema, forms, and types.
- Possible **UI updates** so create/list flows use persisted data via server loads/actions.

## Current state of the codebase (skills-verifier)

### Provider system

- **Implemented**: `Providers()` + `runInContext()` in `[src/lib/server/util/provider/](src/lib/server/util/provider/)`, `AppContext` in `[src/lib/server/app-context.ts](src/lib/server/app-context.ts)`.
- **Dev chain**: `[src/lib/server/dev-app-context.ts](src/lib/server/dev-app-context.ts)` composes `RealTimeServiceCtx`, `RealIdServiceCtx`, `FrameworkClientCtx`, `StorageDatabaseCtx`.
- **Hooks**: `[src/hooks.server.ts](src/hooks.server.ts)` builds `DevAppContext()` per request and wraps `resolve` in `runInContext`. No lazy singleton, no e2e provider switch (unlike tenant-home’s `Lazy(appMain)` + `isE2eProviderEnabled()`).

### Storage

- **Factory**: `[src/lib/server/core/storage/storage-database-factory.ts](src/lib/server/core/storage/storage-database-factory.ts)` — **always `MemoryDatabase` for now**; warns if `DYNAMODB_TABLE` is set. Re-enable Dynamo in the factory when we need production persistence (see `[docs/design/open-questions.md](../../design/open-questions.md)`).
- **Terraform**: `[terraform/dynamodb.tf](terraform/dynamodb.tf)` defines a single-table design for deployed environments.
- **Test**: `[src/lib/server/test-app-context.ts](src/lib/server/test-app-context.ts)` uses `MemoryDatabase` directly.

### UI vs persistence

- `[src/lib/pages/CreateJobPage.svelte](src/lib/pages/CreateJobPage.svelte)` validates and shows success but **does not call** `createJobQuery` / server actions; job creation is still “no persistence yet” (commented stub).
- Domain model in `[src/lib/server/domain/job/job-resource.ts](src/lib/server/domain/job/job-resource.ts)` still includes `**frameworks: FrameworkResource[]`** alongside `**skills\*\*`.

### Frameworks surface area

- Client: `FrameworkSelector`, `SkillsList` (fetch framework → skills), `FRAMEWORKS` config, `FrameworkClient` fake/HTTP.
- Server: `frameworkClient` on `AppContext`, `getFrameworkClient()`.

### Reference: tenant-home

- `[hooks.server.ts](file:///Users/yona/dev/skybridge/skybridgeskills-monorepo/sbs/apps/tenant-home/src/hooks.server.ts)`: `appContext` is either e2e store or `**Lazy(() => appMain(...))**`; `**init**` warms context; uses `**createHandleAppContext**` from shared lib-backend with bindings (e.g. tenant).
- Tests use `**Providers(provideMemoryTestApp, provideBasicTestData, ...)**` and `provider-test` helpers from `@repo/lib-backend`.

Skills-verifier is **standalone** (no `@repo/lib-backend`); inspiration is structural (lazy init, handle composition, test provider stacks), not a direct package import.

## Questions to complete the plan

**Status:** Q1–Q4 are answered — see **Resolved answers** below. The subsections here keep original context.

Each item needed a product/engineering decision; suggested defaults were in italics.

### Q1 — DynamoDB in the architecture

**Context**: Factory already falls back to memory when `DYNAMODB_TABLE` is unset. Terraform targets real AWS. Local options exist: [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html), LocalStack, SAM, etc.—none are wired in this repo today.

**Suggested answer**: Keep the DynamoDB implementation for **deployed** environments; document that **local dev defaults to memory** without extra tooling; optionally add a short README section on DynamoDB Local for contributors who want to exercise the Dynamo path.

### Q2 — Frameworks vs skills-only jobs

**Context**: Domain still has `frameworks[]`; create-job UI is framework-first. Product direction is skills mapped directly onto jobs.

**Suggested answer**: **Migrate domain and API to skills-only** for new writes: drop `frameworks` from `JobResource` / `CreateJobParams` / rows (with a migration strategy if any persisted data exists—likely none in dev). Replace UI with a skill picker that does not require selecting a framework first (could still use `FrameworkClient` internally to search/browse credentials, or start from a static/curated skill list for MVP).

### Q3 — Seed data: what and when

**Context**: Empty `MemoryDatabase` on each process start means list pages stay empty unless something seeds.

**Suggested answer**: `**ServerInit` or first `MemoryDatabase` construction\*\* seeds a small fixed set (e.g. 1–2 jobs, 1–2 job apps) when `database` is memory and `NODE_ENV === 'development'` (or a `SEED_DEV_DATA=true` flag). Keep seed module colocated with domain or `core/storage`.

### Q4 — Provider ergonomics vs tenant-home

**Context**: Per-request `DevAppContext()` is simple but rebuilds the chain every request; tenant-home uses lazy singleton + init.

**Suggested answer**: Introduce `**Lazy`-style** construction for dev (and optionally shared `init` to fail fast on misconfig) **without\*\* pulling monorepo packages—mirror the pattern with a small local helper.

---

## Resolved answers

- **Q1 — DynamoDB**: **Memory-only at runtime for now** (your follow-up “option B”). The form had picked “keep Dynamo for prod”; the **implemented** direction is: factory always memory, Dynamo query code kept for later, details in `[docs/design/open-questions.md](../../design/open-questions.md)`. _Still open:_ when to turn Dynamo back on for a real deploy.
- **Q2 — Frameworks vs skills**: **Optional framework metadata** — keep `frameworks[]` as optional/denormalized hints for display or analytics, not required for job creation; evolve UI/schema toward skills-first without deleting the field immediately.
- **Q3 — Seed data**: **Seed whenever storage is `MemoryDatabase`** (not only `NODE_ENV=development`). _Implementation note:_ tests that need an empty DB should use an explicit unseeded path or reset helper so seeding does not break isolated tests.
- **Q4 — Provider lifecycle**: **Construct app context once at server startup** (e.g. SvelteKit `init`), **not** on every request; **no need for Lazy** for this app unless startup ordering forces it later. Each request still runs inside `runInContext(existingCtx, …)` so `appContext()` resolves from ALS.

## Notes

- Architecture and phase proposal: [`00-design.md`](./00-design.md). Broader persistence/framework options: [`docs/design/open-questions.md`](../../design/open-questions.md).
