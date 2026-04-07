# Design: skill search service (hexagonal) + app wiring

## Scope of work

- **Port**: `SkillSearchService` with DTOs (`SkillSearchQuery`, `SkillSearchResult`, etc.) via **ZodFactory**, colocated with the port in **`skill-search-service.ts`**.
- **Adapters**: **fake** (hardcoded list) and **real** (Credential Engine Registry Search API, `POST` + Bearer token).
- **Env**: **`CONTEXT`** = `aws` | `dev` | `test` with rules in [`docs/deployment.md`](../../deployment.md); parse once at startup with Zod.
- **Wiring**: `skillSearchService` on **`AppContext`**, **`hooks.server.ts`** builds context from parsed env; **`TestAppContext`** uses fake search (equivalent to `CONTEXT=test`).
- **HTTP**: **`src/routes/api/skill-search/+server.ts`** (e.g. `POST` JSON body with query string) — **no** create-job UI in this plan.
- **Docs / examples**: [`.env.example`](../../../.env.example), [`docs/deployment.md`](../../deployment.md) (already started).

## File structure

```
src/lib/server/
├── app-context.ts                         # UPDATE: skillSearchService on interface + SkillSearchServiceCtx
├── app-env.ts                             # NEW: Zod discriminated union CONTEXT; parseBaseEnv(env)
├── build-app-context.ts                   # NEW: async (env) => AppContext from CONTEXT → delegate to *-app-context.ts
├── aws-app-context.ts                     # NEW: parse CE env (required), provider chain with provideCredentialEngineSkillSearchService
├── dev-app-context.ts                     # UPDATE: parse optional CE env, provider chain with conditional skill search provider
├── test-app-context.ts                    # UPDATE: include provideFakeSkillSearchService in chain (always fake)
├── services/skill-search/
│   ├── skill-search-service.ts            # NEW: ZodFactory DTOs + SkillSearchService port interface + SkillSearchServiceCtx + skillSearchService() helper
│   ├── provide-fake-skill-search-service.ts
│   ├── fake-skill-search-service.ts
│   ├── fake-skill-search-service.test.ts
│   └── credential-engine/                 # NEW: CE Registry Search API–specific pieces
│       ├── provide-credential-engine-skill-search-service.ts
│       ├── credential-engine-skill-search-service.ts
│       ├── credential-engine-skill-search-service.test.ts
│       ├── map-credential-engine-search-response.ts
│       ├── map-credential-engine-search-response.test.ts
│       ├── credential-engine-search-request.ts
│       └── fixtures/
hooks.server.ts                            # UPDATE: import { env } from '$env/dynamic/private', pass to buildAppContext(env)
src/routes/api/skill-search/
└── +server.ts                             # NEW: validate input, call skillSearchService()
package.json                               # UPDATE: vitest script env CONTEXT=test
vitest.config.ts                           # UPDATE: if needed for envDefaults
```

**Provider pattern** (following `email-service` example):

- `provideFakeSkillSearchService()` → returns `SkillSearchServiceCtx` with fake implementation
- `provideCredentialEngineSkillSearchService(ctx: AwsAppEnvCtx | DevAppEnvCtx)` → returns `SkillSearchServiceCtx` with CE implementation
- Each `*-app-context.ts` includes the appropriate provider in its `Providers(...)` chain

**Env passing pattern** (following monorepo hooks.server.ts):

- Use `import { env } from '$env/dynamic/private'` in `hooks.server.ts` (SvelteKit server-side env)
- Pass `env` object to `buildAppContext(env)`
- Each `*-app-context.ts` function receives `env` as parameter instead of accessing `process.env` directly
- Each parses its own env schema from the passed object

**Env parsing per context**:

- `aws-app-context.ts`: `AwsAppEnv` schema with required `CREDENTIAL_ENGINE_SEARCH_URL` and `CREDENTIAL_ENGINE_API_KEY`
- `dev-app-context.ts`: `DevAppEnv` schema with optional CE vars; logic to pick fake vs real
- `test-app-context.ts`: minimal/no env parsing; always fake skill search

## Conceptual architecture

```
                    ┌─────────────────────────────────────────┐
                    │  SvelteKit hooks.server.ts              │
                    │  import { env } from '$env/dynamic/private'
                    │  buildAppContext(env)                   │
                    └─────────────────┬───────────────────────┘
                                      │
                    ┌─────────────────▼───────────────────────┐
                    │  parseBaseEnv(env) → CONTEXT            │
                    │  Switch on CONTEXT:                     │
                    │    aws  → AwsAppContext(env)              │
                    │    dev  → DevAppContext(env)              │
                    │    test → TestAppContext(env)             │
                    └─────────────────┬───────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
     ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
     │ AwsAppContext   │    │ DevAppContext   │    │ TestAppContext  │
     │   - parse CE    │    │   - parse env   │    │   - minimal     │
     │   - real search │    │   - conditional │    │   - fake only   │
     │   - Providers() │    │   - Providers() │    │   - Providers() │
     │     (provideCE) │    │   (provideCE|   │    │   (provideFake) │
     │                 │    │    provideFake) │    │                 │
     └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
              │                       │                       │
              └───────────┬───────────┘                       │
                          │                                   │
              ┌───────────▼───────────┐              ┌────────▼────────┐
              │ SkillSearchServiceCtx   │              │ (tests only)    │
              │ { skillSearchService }  │              └─────────────────┘
              │ helper: skillSearchService()          │
              └───────────┬───────────┘
                          │
              ┌───────────▼───────────┐
              │ POST /api/skill-search │
              └───────────────────────┘
```

- **Inbound**: HTTP route validates **`SkillSearchQuery`** (or a minimal `{ q: string }` that maps to it), calls `skillSearchService().search(...)`
- **Outbound**: CE adapter maps registry response to **`SkillSearchResult[]`**; route returns JSON-serializable DTOs

## Main components and how they interact

1. **`hooks.server.ts`** — Uses SvelteKit pattern:

   ```typescript
   import { env } from '$env/dynamic/private';

   const baseEnv = parseBaseEnv(env);
   serverAppContext = await buildAppContext(env); // passes full env to context builders
   ```

2. **`parseBaseEnv(env)`** (in `app-env.ts`) — Parses with Zod to extract `CONTEXT` (`aws` | `dev` | `test`). Only parses the base env; full env parsing happens in each `*-app-context.ts`.

3. **`buildAppContext(env)`** (in `build-app-context.ts`) — Switches on `CONTEXT`:
   - **`aws`**: calls `AwsAppContext(env)` which parses `AwsAppEnv` (requires CE URL + API key), builds `Providers(...)` with `provideCredentialEngineSkillSearchService`
   - **`dev`**: calls `DevAppContext(env)` which parses `DevAppEnv` (optional CE vars), picks provider inline based on env presence
   - **`test`**: calls `TestAppContext(env)` which always uses `provideFakeSkillSearchService`

4. **Provider functions** (not inline arrow functions):

   ```typescript
   // services/skill-search/provide-fake-skill-search-service.ts
   export function provideFakeSkillSearchService(): SkillSearchServiceCtx {
   	return { skillSearchService: FakeSkillSearchService() };
   }

   // services/skill-search/credential-engine/provide-credential-engine-skill-search-service.ts
   export function provideCredentialEngineSkillSearchService(
   	ctx: AwsAppEnvCtx | DevAppEnvCtx
   ): SkillSearchServiceCtx {
   	return {
   		skillSearchService: CredentialEngineSkillSearchService({
   			url: ctx.appEnv.CREDENTIAL_ENGINE_SEARCH_URL,
   			apiKey: ctx.appEnv.CREDENTIAL_ENGINE_API_KEY
   		})
   	};
   }
   ```

5. **Context-specific files** — Each receives `env` parameter and parses its own schema:

   ```typescript
   // aws-app-context.ts
   export async function AwsAppContext(env: Record<string, string>): Promise<AppContext> {
   	const parsedEnv = AwsAppEnv.parse(env);
   	return Providers(
   		RealTimeServiceCtx,
   		RealIdServiceCtx,
   		FrameworkClientCtx,
   		StorageDatabaseCtx,
   		() => provideCredentialEngineSkillSearchService({ appEnv: parsedEnv })
   	)();
   }

   // dev-app-context.ts
   export async function DevAppContext(env: Record<string, string>): Promise<AppContext> {
   	const parsedEnv = DevAppEnv.parse(env);
   	const useRealCE =
   		parsedEnv.CREDENTIAL_ENGINE_API_KEY && parsedEnv.CREDENTIAL_ENGINE_SEARCH_URL;
   	return Providers(
   		RealTimeServiceCtx,
   		RealIdServiceCtx,
   		FrameworkClientCtx,
   		StorageDatabaseCtx,
   		useRealCE
   			? () => provideCredentialEngineSkillSearchService({ appEnv: parsedEnv })
   			: provideFakeSkillSearchService
   	)();
   }

   // test-app-context.ts
   export async function TestAppContext(_env?: Record<string, string>): Promise<AppContext> {
   	return Providers(
   		FakeTimeServiceCtx,
   		FakeIdServiceCtx,
   		FrameworkClientCtx,
   		() => ({ database: new MemoryDatabase() }),
   		provideFakeSkillSearchService
   	)();
   }
   ```

6. **`skill-search-service.ts`** — Contains:
   - ZodFactory DTOs (`SkillSearchQuery`, `SkillSearchResult`, etc.)
   - `SkillSearchService` interface
   - `SkillSearchServiceCtx` type
   - `skillSearchService()` helper using `providerCtx<SkillSearchServiceCtx>()`

**Default `CONTEXT`**: If unset in `env.CONTEXT`, default to `dev` in `parseBaseEnv()` for local development ergonomics. Document in `docs/deployment.md` and `.env.example`.

## Style conventions

- **Factory functions** for `FakeSkillSearchService()`, `CredentialEngineSkillSearchService(config)`; **no classes** for new services.
- **Provider functions** (`provideFakeSkillSearchService`, `provideCredentialEngineSkillSearchService`) return `SkillSearchServiceCtx` shape, used directly in `Providers(...)` chains.
- **ZodFactory** + **port interface** + **context type** + **helper function** all live together in **`skill-search-service.ts`**.
- **Providers**: Each `*-app-context.ts` builds its own `Providers(...)` chain, referencing the provider functions.
- **Layout**: skill search lives under **`src/lib/server/services/skill-search/`**; CE-specific pieces under **`credential-engine/`**.
- **Order by abstraction** in files; extract helpers if approaching **~200 lines**.
- **Tests**: Co-located per adapter / per pure mapper under `services/skill-search/`; fixtures under `credential-engine/fixtures/`.
- **TSDoc**: new public exports get brief docs per `documentation.md`.

## Proposed implementation phases

1. **Server env + context dispatch** — `app-env.ts` (base CONTEXT parsing), `build-app-context.ts` (dispatcher taking env param), refactor `hooks.server.ts` to use `$env/dynamic/private` and new dispatch.
2. **Dev context + fake skill search** — Update `dev-app-context.ts` to accept env param, add optional CE env parsing, add `services/skill-search/` with port, fake adapter, `provideFakeSkillSearchService`, and `fake-skill-search-service.test.ts`.
3. **AWS context + real skill search** — Create `aws-app-context.ts` with required CE env, `credential-engine/` adapter with mapper and fixtures, `provideCredentialEngineSkillSearchService`, `credential-engine-skill-search-service.test.ts` and `map-credential-engine-search-response.test.ts`.
4. **Test context** — Update `test-app-context.ts` to accept env param, ensure `provideFakeSkillSearchService` in chain, add `CONTEXT=test` to test scripts.
5. **API route** — `POST /api/skill-search`, input validation, JSON response; tests with `runInContext` + `TestAppContext`.
6. **Cleanup & validation** — Remove TODOs, `pnpm check` + `pnpm test:vitest`.

When you confirm or adjust phases, save **`01-…` through `06-…`** phase files in this directory with full Implementation Details and Validate sections.
