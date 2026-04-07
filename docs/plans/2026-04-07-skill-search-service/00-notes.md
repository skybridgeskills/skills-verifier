# Plan notes: skill search service

## Scope of work

- Add a **skill search** capability with **hexagonal (ports & adapters) layout**: an application-facing port (interface + domain DTOs validated with ZodFactory), a **fake adapter** (hardcoded skill list), and a **real adapter** that calls **Credential Engine** (consuming path).
- **Wire the port into the app** via `AppContext` + **API route** + tests (**no** create-job / `FrameworkSelector` UI in this plan — follow-up plan).
- **Environment behavior** (explicit `CONTEXT`; see [`docs/deployment.md`](../../deployment.md))
  - **`aws`**: `CREDENTIAL_ENGINE_API_KEY` and `CREDENTIAL_ENGINE_SEARCH_URL` **required**; real adapter only; **fail fast** if missing or invalid.
  - **`dev`**: real adapter **only if both** CE vars are set (non-empty); otherwise **fake**.
  - **`test`**: **always fake** skill search (ignore CE vars) for deterministic tests.
- Add **`.env.example`** entries for the new variables.
- Add **`docs/deployment.md`** describing deployment configuration (context, CE vars, fake vs real).
- Introduce or extend a **Zod-based app env** shape (similar in spirit to `app-main.ts` + `AppContextEnv` in the monorepo) so server boot parses and validates configuration once.

## References (ground truth)

- **Product / API direction** (Registry Search API / CTDL JSON queries, example query, work-related CTDL types): SkyBridge Skills shared notes (Google Drive), sections on Query Helper, Search API Handbook (`https://credreg.net/registry/searchapi`), and example `@type` / `search:termGroup` payloads for Job/Occupation/Task/WorkRole with embodied competencies.
- **OSMT CE integration** (`/Users/yona/dev/skybridge/osmt`): Kotlin package `edu.wgu.osmt.credentialengine` — **Registry Assistant** (`{registryUrl}/assistant/...`) is used for **publish/sync**, not for consumer search. Default registry base in code: `https://sandbox.credentialengine.org`. Skills Verifier **search** uses the **Registry Search API** (`POST .../assistant/search/ctdl`), not the publish client.
- **Wiring pattern**: `skybridgeskills-monorepo` `sbs/packages/lib-backend/src/core/app-context/app-main.ts` — parse env with Zod, branch on `CONTEXT`. Skills Verifier uses **`aws` | `dev` | `test`** (`test` is analogous to monorepo **`memory`** for tests).

## Current state of the codebase

- **App context**: `AppContext` (`src/lib/server/app-context.ts`) holds `timeService`, `idService`, `frameworkClient`, `database`. Built via `devAppProviders` in `dev-app-context.ts` (no `CONTEXT` switch yet; always dev-shaped providers).
- **Hooks**: `hooks.server.ts` builds context once in `init` with `DevAppContext()` and wraps requests in `runInContext`.
- **Credential Engine today**: `FrameworkClient` toggles **fake vs HTTP** based on `CONTEXT` and CE env vars (same as skill search). Fetches **JSON-LD by URL** (`HttpFrameworkClient`). That is **not** a keyword search API; it complements a future **skill search** port.
- **UI**: Create-job flow still **framework-first** (`FrameworkSelector` + `SkillsList` client-side filtering). `docs/design/open-questions.md` records tension with skills-only direction—search service supports moving toward skill discovery without requiring a framework first.
- **Env**: `.env.example` documents CE credentials only; no separate framework/storage toggles. Context-based selection in app contexts.

## Style conventions (for this plan)

- **Factory functions** for services; **no classes** for new domain services (adapters may wrap minimal classes only if matching an existing client pattern—prefer factories returning `{ search: … }` like other services).
- **ZodFactory** for `SkillSearchQuery`, `SkillSearchResult`, and **app env** slices exposed to the server.
- **Providers**: Each `*-app-context.ts` builds its own `Providers(...)` chain with the appropriate skill search adapter selected inline (no `createSkillSearchService` factory).
- **Service layout**: colocate under `src/lib/server/services/skill-search/` — port + ZodFactory DTOs in `skill-search-service.ts`, fake adapter at package root, Credential Engine–specific modules under `credential-engine/`.
- **Files ~200 lines**; one main concept per file.

## Questions (to resolve one at a time)

### Q1 — How should we detect “AWS context”? ✅ **ANSWERED**

**Context**: This repo does not yet read a `CONTEXT` variable like the monorepo’s `app-main.ts`. Today production behavior is not fully split from dev in code paths.

**Answer**: Use the **same explicit pattern as the monorepo**: env var **`CONTEXT`** (not host inference), parsed with a Zod discriminated union at startup. Values: **`aws` | `dev` | `test`** (`test` replaces monorepo `memory` for this app’s test-only fake skill search). Selection rules: **`aws`** — CE URL + API key required; **`dev`** — CE only if **both** vars set, else fake; **`test`** — always fake. Document in [`docs/deployment.md`](../../deployment.md).

### Q2 — What is the minimum “wired into the app” for this plan? ✅ **ANSWERED**

**Context**: Search could be exposed as an internal service only, a `+server.ts` route, a server `load` for a page, or a full create-job UI rework.

**Answer**: **`skillSearchService` on `AppContext`**, an **API route** (e.g. `src/routes/api/skill-search`) that calls the port, and **tests** for fake + real adapter behavior. **UI** changes (create-job / `FrameworkSelector`) stay **out of scope** — separate plan.

### Q3 — Exact Credential Engine Registry Search API contract ✅ **ANSWERED**

**Context**: Shared notes point to the Search API handbook and Query Helper; the example body uses CTDL search terms (`search:termGroup`, `ceasn:skillEmbodied`, etc.). Implementation needs base URL, auth (API key header per CE docs), and a stable mapping from **user keywords** → **our** `SkillSearchResult` (id, label, uri, optional ctid).

**Answer (locked env + HTTP)** — per [Credential Engine Search API handbook](https://credreg.net/registry/searchapi):

| Variable                       | Required                                                                                    | Notes                                                                                                                                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CREDENTIAL_ENGINE_SEARCH_URL` | **Yes** whenever the real adapter runs (`CONTEXT=aws`, or `CONTEXT=dev` with both vars set) | No implicit default for **adapter selection** — **dev** must set this (e.g. sandbox `https://sandbox.credentialengine.org/assistant/search/ctdl`) to use CE. **aws** must set (typically production `https://apps.credentialengine.org/assistant/search/ctdl`). |
| `CREDENTIAL_ENGINE_API_KEY`    | Same as above                                                                               | Server-only. **`Authorization: Bearer <CREDENTIAL_ENGINE_API_KEY>`** on POST to `CREDENTIAL_ENGINE_SEARCH_URL`.                                                                                                                                                 |

**Request body**: HTTP **POST**; JSON body is the Search API wrapper + CTDL query object as in the handbook (not separate “GraphQL”; this is the CTDL JSON Search API). Adapter implementation chooses the competency-relevant query shape (including shared-notes examples / keyword terms); map responses into ZodFactory **`SkillSearchResult`** (and related) with fixture tests.

**Do not** use `PUBLIC_*` for the API key (handbook: do not expose the key to the browser).

### Q4 — Relationship to `PUBLIC_USE_FAKE_FRAMEWORK_SERVICE` ✅ **ANSWERED**

**Context**: Framework client fake toggle is separate from skill search.

**Answer**: **Unified** — both framework client and skill search now use the same gating logic: `CONTEXT=aws` requires CE vars, `CONTEXT=dev` uses CE vars when present (otherwise fake), `CONTEXT=test` always uses fake. See [`docs/deployment.md`](../../deployment.md). “all CE off” flag. Framework fetch uses `PUBLIC_USE_FAKE_FRAMEWORK_SERVICE`; skill search uses `CONTEXT` + CE vars as above. Documented under “Skill search vs framework client” in [`docs/deployment.md`](../../deployment.md).

---

## Answers (filled during question iteration)

### Q1 — AWS / deployment context

- **`CONTEXT`**: **`aws` | `dev` | `test`** (explicit; no host inference). **`test`** = always fake skill search; aligns with monorepo’s idea of a test **`memory`** context but uses the name **`test`** here.
- **`aws`**: both `CREDENTIAL_ENGINE_SEARCH_URL` and `CREDENTIAL_ENGINE_API_KEY` **required**.
- **`dev`**: real CE **iff both** CE vars are non-empty; else fake.
- **`test`**: always fake skill search.
- **Document** in [`docs/deployment.md`](../../deployment.md).

### Q2 — Wiring surface

- **`skillSearchService`** on `AppContext`, **API route** for search, **unit/integration tests** for adapters.
- **UI** work deferred to a **separate plan**.

### Q3 — Credential Engine Search API (locked)

- **`CREDENTIAL_ENGINE_SEARCH_URL`** — required whenever the real adapter runs; typical values: sandbox **`https://sandbox.credentialengine.org/assistant/search/ctdl`**, production **`https://apps.credentialengine.org/assistant/search/ctdl`** (per handbook).
- **`CREDENTIAL_ENGINE_API_KEY`** — Bearer token for **`Authorization`** on POST; server-only.
- Query JSON and result mapping in phases with fixtures.

### Q4 — Framework client

- **Unified with skill search** — both use the same `CONTEXT` + CE vars gating (see [`docs/deployment.md`](../../deployment.md)).
