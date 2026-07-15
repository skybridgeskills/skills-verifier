# Architecture

## Technologies

- Core
  - `nvm` -- node version management
  - `pnpm` -- package management
  - `turbo` -- build orchestration
- Code Quality
  - `eslint` -- linting
  - `prettier` -- formatting
  - `prettier-plugin-organize-imports` -- auto-organize imports
  - `vitest` -- unit tests
  - `storybook` -- visual tests
  - `playwright` -- e2e tests
  - `svelte-check` -- type checking
  - `typescript` -- type system
  - `husky` -- git hooks
- Build Tools
  - `vite` -- build tool and dev server
  - `@sveltejs/adapter-node` -- Node.js deployment (ECS/Fargate)
- Framework
  - `sveltekit` -- main app framework, routing, ui, server framework
- Frontend
  - `tailwindcss` -- styling
  - `@tailwindcss/forms` -- form styling utilities
  - `@tailwindcss/typography` -- typography plugin
  - `shadcn-svelte` -- ui components
  - `clsx` -- class name management
  - `tailwind-merge` -- merge Tailwind classes (often paired with clsx)
  - `@iconify/tailwind4` -- icon system integration with Tailwind
  - `@iconify-json/*` -- icon sets (e.g., material-symbols-light, mdi-light, ic)
  - `sveltekit-superforms` -- form handling and validation (recommended)
  - `svelte-french-toast` -- toast notifications (recommended)
- Backend
  - `zod` -- data validation
  - `zod-factory` pattern -- combine runtime validation and TypeScript types

## Application Context & Dependency Injection

The application uses a **provider pattern** with AsyncLocalStorage for dependency injection. This enables:

- Shared context (DB, services, config) across tests, stories, and production
- No manual threading of dependencies through call stacks
- Easy swapping of implementations (fake vs real) based on environment

### Context Dispatch

The application dispatches to different context builders based on `CONTEXT` environment variable:

| Context | Use Case                   | Skill Search                     |
| ------- | -------------------------- | -------------------------------- |
| `aws`   | Production AWS environment | Credential Engine (required)     |
| `dev`   | Local development          | CE if configured, otherwise fake |
| `test`  | Unit/integration tests     | Always fake                      |

**Key files:**

- `src/lib/server/app-env.ts` -- Zod schemas for environment parsing
- `src/lib/server/build-app-context.ts` -- Dispatcher based on `CONTEXT`
- `src/lib/server/aws-app-context.ts` -- AWS production context
- `src/lib/server/dev-app-context.ts` -- Local development context
- `src/lib/server/test-app-context.ts` -- Test context

Environment variables are passed through from SvelteKit's `$env/dynamic/private` rather than accessed directly via `process.env`.

## Services (Hexagonal/Ports & Adapters)

Services follow a **hexagonal architecture** pattern with:

- **Port**: Interface + DTOs (ZodFactory) defining the service contract
- **Adapters**: Multiple implementations of the port
- **Provider functions**: Return context slice for dependency injection

### Skill Search Service

Location: `src/lib/server/services/skill-search/`

**Port** (`skill-search-service.ts`):

- `SkillSearchService` interface with `search(query) -> Promise<SkillSearchResult[]>`
- `SkillSearchQuery` / `SkillSearchResult` ZodFactory DTOs
- Context type `SkillSearchServiceCtx` for provider injection

**Adapters**:

- **Fake** (`fake-skill-search-service.ts`): Hardcoded curated skills for local dev/tests
- **Credential Engine** (`credential-engine/credential-engine-skill-search-service.ts`): HTTP client for CE Registry Search API

**Provider functions**:

- `provideFakeSkillSearchService()` -- Returns fake implementation
- `provideCredentialEngineSkillSearchService(config)` -- Returns CE implementation

**Credential Engine Integration** (`credential-engine/`):

- `credential-engine-search-request.ts` -- Builds CTDL JSON query body per handbook
- `map-credential-engine-search-response.ts` -- Pure function mapping CE response to domain DTOs
- `fixtures/` -- Sample CE responses for tests (no live HTTP in unit tests)

See [docs/deployment.md](deployment.md) for CE environment configuration.

### Framework Client

Location: `src/lib/clients/framework-client/`

Fetches JSON-LD competency frameworks from Credential Engine Registry.

- `FrameworkClient` interface for fetching frameworks and skills by URL
- `FakeFrameworkClient` -- Mock for Storybook/tests
- `HttpFrameworkClient` -- Real HTTP implementation
- Selected by `CONTEXT` and Credential Engine env vars (same as skill search)

Note: This is **separate** from skill search. Framework client fetches by URL (browse mode), while skill search queries by keyword (search mode).

## Create job UI (skills-first)

The create-job flow does **not** require selecting a framework. Users add skills via:

- **QuickSkillPicks** (`sample-skills.ts`) — one-click curated skills
- **SkillSearch** (`components/skill-search/`) — debounced search calling `POST /api/skill-search`, implemented with `searchSkills()` in `src/lib/clients/skill-search-client.ts`

Selected skills are shown in **SelectedSkillsColumn**. The form still posts `frameworksJson` as an empty array for backend compatibility.

## API Routes

SvelteKit server routes (`src/routes/api/*`):

- `POST /api/skill-search` -- Search for skills by query string
  - Accepts `{ query: string, limit?: number }`
  - Returns `{ results: SkillSearchResult[], meta: {...} }`
  - Uses `skillSearchService` from app context
  - Input/output validated with ZodFactory

Additional endpoints:

- `GET /health` — ALB health (`200`, no external I/O).
- `GET /version` — Deploy/version JSON (OSMT-style; includes optional `extra.sbsMonorepoVersion` when built from the monorepo wrapper).

## Admin auth

A lightweight, **single-password** admin experience — no user accounts, roles, or
identity provider. The public site stays fully usable without logging in; only
admin-only UI and the destructive delete-job action are gated.

- **Service** — `AuthService` (`src/lib/server/services/auth/`) is provider-injected
  into `AppContext`. It reads `ADMIN_PASSWORD` + `AUTH_SECRET` from env. On
  `CONTEXT=aws` both are **required** (fail-fast); `dev`/`test` fall back to insecure
  defaults so the app boots offline.
- **Session token** — a small HMAC-SHA256 token (`session-token.ts`), not a JWT
  dependency: `<base64url(payload)>.<base64url(sig)>` with payload `{ sub:'admin',
iat, exp }`, signed with `AUTH_SECRET`. Verified constant-time (`timingSafeEqual`),
  then the `exp` is checked. Password compare is also timing-safe.
- **Cookie** — `sessionToken`: `httpOnly`, `sameSite=lax`, `secure` on https,
  `path=/`, 30-day expiry (`store-session-cookie.ts`).
- **Login/logout** — unlisted `/auth` login page posts the password; on success the
  cookie is set and the request redirects to `/` or a validated local `?next=`
  (`safe-next.ts` blocks open redirects). `/logout` is **POST-only** (clears the
  cookie). The header shows **Log out** only when authenticated.
- **Request wiring** — `hooks.server.ts` verifies the cookie and sets
  `event.locals.admin`; `+layout.server.ts` exposes it as `page.data.admin`. Any
  verify/parse failure yields `admin: false`.
- **Delete job** — `/jobs/[id]` gains a `?/deleteJob` form action gated by
  `locals.admin` (server check is authoritative; the button is hidden for
  non-admins). `deleteJobQuery` hard-deletes the job and cascades to its matches +
  job-apps, then redirects to `/jobs`.

## Skills match + credential verification

A **match** pairs a job's required skills with a candidate's verified credentials. The flow lives at
`/jobs/{jobId}/match/{matchId}` and is identified by that **capability URL alone** (no auth yet — see
[design/open-questions.md](design/open-questions.md); the `// IDENTITY (fast-follow)` seams mark where
ownership/session will attach).

### Match domain entity

Location: `src/lib/server/domain/match/`

A `MatchResource` (`match-resource.ts`) holds the job id, the verify-exchange handle
(`exchangeId`/`vcapi`/`exchangeState`), `verifiedCredentials`, and skill→credential `assignments`.

Single-table key pattern (`match-row.ts`, `matchMetaKeys()`):

- `PK = MATCH#{id}`, `SK = META` — the match meta item (`MATCH#{id}/META`).
- `GSI1PK = JOB#{jobId}`, `GSI1SK = MATCH#{createdAtIso}#{id}` — list a job's matches by recency.

Queries: `create-match-query.ts`, `match-by-id-query.ts`, `list-matches-by-job-query.ts`,
`save-match-credentials-query.ts`, `save-match-assignments-query.ts`.

### Verification-exchange provider (port + adapters)

Location: `src/lib/server/domain/verification/`

**Port** (`verification-exchange.ts`): `VerificationExchange` with `createVerifyExchange()` and
`getExchangeStatus()`, plus `ExchangeProtocols`/`ExchangeStatus` types.

**Adapters**:

- **Http** (`http-verification-exchange.ts`): backs the DCC `dcc-transaction-service` verify workflow
  (VC-API + QueryByExample scoped to Open Badges v3). Sends `Bearer` auth only when
  `TRANSACTION_SERVICE_TOKEN` is set; the token is never logged and never returned to the client.
- **Fake** (`fake-verification-exchange.ts`): in-memory exchange for dev/tests with no network.

**Selection** (by `CONTEXT` + config, `verification-config.ts`): `aws` always uses Http; `dev` uses
Http when `TRANSACTION_SERVICE_BASEURI` is set, otherwise Fake; `test` always uses Fake.

### QR / interact-URL + server-proxied polling

1. `startExchange` (match `+page.server.ts`) creates an exchange, persists `exchangeId`/`vcapi`, and
   renders the interact URL (`iu`) as a **QR code** for the wallet.
2. The browser polls `GET /jobs/{jobId}/match/{matchId}/status` every few seconds. That endpoint reads
   `exchangeId`/`vcapi` from the **persisted match** (never trusted from the client) and proxies the
   VC-API status. **Poll-only** — OID4VP / push completion is not supported upstream.
3. On `complete` **or `invalid`**, the verifier-core result is passed through: verified credentials
   and their distilled problems are persisted to the match, and the board lets the user assign
   credentials to skills and write a narrative per assignment (`components/match-board/`).

### Forgiving invalid results

An `invalid` exchange still carries a usable verifier-core result. Rather than dead-ending, the
`status`/`present` routes persist per-credential `verified` + `problems[]` and match-level
`presentationProblems[]` (distilled `{ check?, title, detail?, fatal }`, not the raw result) for
both `complete` and `invalid`. Applicants can then build matches from unverified or warned
credentials: the board derives one overall banner (`deriveVerificationOutcome` in
`src/lib/verification/verification-status.ts` — `invalid` if any `fatal` problem, else `warning` if
any problem, else `valid`) and each card exposes its problems; the read-only employer view shows a
per-credential status indicator. Cryptographically invalid credentials are assignable but always
explicitly surfaced. The current error state is preserved only when no usable result exists (no
`results.default`, expired exchange, transport failure, or a hard VP rejection in the relay). See
[adr/2026-07-12-forgiving-invalid-verification-results.md](adr/2026-07-12-forgiving-invalid-verification-results.md).

### Additional exchanges (accumulate credentials)

Applicants can run more than one exchange per match — two wallets, or a wallet that submits one
badge at a time. After a prior exchange has concluded, the board exposes an inline **"Import more
badges"** panel (`components/match-board/ImportMoreBadges.svelte`) that runs another exchange without
unmounting the board, so unsaved draft assignments survive. On completion, `saveMatchCredentialsQuery`
performs an **additive merge** (`merge-credentials.ts`): incoming credentials accumulate onto the
match, deduped by `credentialId` with last-write-wins (a re-submitted credential refreshes its
status). `presentationProblems` is replaced with the latest exchange's. Exchanges are sequential
(one `exchangeId`/`vcapi` at a time). See
[adr/2026-07-12-additive-match-credential-merge.md](adr/2026-07-12-additive-match-credential-merge.md).

Per-credential display metadata (name, issuer, `validFrom`/`validUntil`, description, image, and a
collapsed status+errors disclosure) is extracted best-effort from each credential's raw
OpenBadgeCredential JSON by `badge-detail.ts` and rendered by a shared
`components/match-board/BadgeMetadata.svelte` across the credentials list, the assigned-skill view,
and the read-only employer summary.

## Storage

- **`CONTEXT=aws`**: **DynamoDB** (`DynamoStorageDatabase` + `createStorageDatabase`)
- **`dev` / `test`**: **`MemoryDatabase`**

Key files:

- `src/lib/server/core/storage/memory-database.ts` -- In-memory implementation
- `src/lib/server/core/storage/dynamo-client.ts` -- AWS SDK client (region from env / arg)
- `src/lib/server/core/storage/storage-database-factory.ts` -- selects memory vs Dynamo by `CONTEXT`

## Environment Configuration

Explicit `CONTEXT`-based configuration per environment:

- `CONTEXT=aws` -- Requires Credential Engine + **DynamoDB** table name (`DYNAMODB_TABLE`)
- `CONTEXT=dev` -- Optional CE credentials (falls back to fake)
- `CONTEXT=test` -- Always uses fake implementations

See [docs/deployment.md](deployment.md) for full configuration reference.

Key variables:

- `CREDENTIAL_ENGINE_SEARCH_URL` -- CE Registry Search API endpoint
- `CREDENTIAL_ENGINE_API_KEY` -- Bearer token for CE API
- `ADMIN_PASSWORD` -- Admin login password (required on `aws`; defaults to `dev` on dev/test)
- `AUTH_SECRET` -- HMAC seed for admin session tokens (required on `aws`; insecure default on dev/test)
