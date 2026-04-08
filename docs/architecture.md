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
