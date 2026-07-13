# LER Skills Verifier

An open-source demonstration tool for skills-first hiring and advancement practices. The LER Skills Verifier helps employers verify, trust, and match Learning and Employment Records (LERs) to job requirements, addressing a critical gap in the LER ecosystem.

## Overview

The LER Skills Verifier is a web application that enables employers to:

- **Verify credentials** - Authenticate and validate LERs from various issuers
- **Match skills** - Connect skills recognized by education to those referenced in position descriptions
- **Evaluate trustworthiness** - Assess the authenticity and credibility of credentials from previously-unknown organizations
- **Process at scale** - Sort through large numbers of LERs and match them to job requirements
- **Demonstrate value** - Provide a tangible example of how LERs can be consumed and used by employers

The tool addresses key gaps in the LER ecosystem by providing an open-source, employer-facing solution that makes LERs approachable and immediately usable. It integrates with existing T3 Network innovations like LinkedClaims, Trusted Career Profile (LER-RS), Resume Author, and JobSIDE.

### Design Goals

- Make LERs more approachable for skills-based hiring and advancement
- Provide an always-available demonstration tool
- Add simple skills documentation to existing job application processes
- Support applicants with or without prior LERs
- Enable adoption by ATS/HRIS vendors through working examples and source code

## Development

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- pnpm (version 10.22.0 or compatible)

### Versioning

Release versions are **git tags** (date-based), not the `version` field in `package.json`. See [docs/design/versioning.md](docs/design/versioning.md).

### Setup

1. **Clone the repository**

   ```sh
   git clone <repository-url>
   cd skills-verifier
   ```

2. **Install dependencies**

   ```sh
   pnpm install
   ```

3. **Set up Git hooks**

   Git hooks are automatically configured via the `prepare` script. Husky will set up pre-commit hooks that run formatting checks.

4. **Start the development server**

   ```sh
   turbo dev
   ```

   The app will be available at `http://localhost:5173` (or the port shown in the terminal).

   To run Storybook separately:

   ```sh
   turbo storybook
   ```

   Storybook will be available at `http://localhost:6006`

### VS Code Launch Configurations

This project includes VS Code launch configurations for debugging:

- **App: dev** – Runs `pnpm dev` in the integrated terminal
- **Storybook** – Runs `pnpm storybook` in the integrated terminal

Open the Run and Debug panel (`Cmd+Shift+D` / `Ctrl+Shift+D`) to use these.

### Development Tools

#### Type Checking (Watch Mode)

Run type checking in watch mode for faster feedback:

```sh
pnpm run check:watch
```

## Turbo Commands

This project uses [Turborepo](https://turbo.build/) for task orchestration and caching. All commands should be run through Turbo for optimal performance.

### Category Tasks

These are high-level tasks that orchestrate multiple tool-specific tasks:

#### Build

Build the application for production:

```sh
pnpm turbo build
```

This runs:

- `build:svelte` - Builds the SvelteKit application

#### Check

Run all code quality checks:

```sh
pnpm turbo check
```

This runs:

- `check:prettier` - Checks code formatting
- `check:eslint` - Lints code for errors
- `check:typescript` - Type checks TypeScript
- `check:svelte` - Validates Svelte components

#### Fix

Auto-fix formatting and linting issues:

```sh
pnpm turbo fix
```

This runs:

- `fix:prettier` - Formats code with Prettier
- `fix:eslint` - Fixes ESLint issues automatically

#### Test

Run unit tests:

```sh
pnpm turbo test
```

This runs:

- `test:vitest` - Executes Vitest unit tests

#### E2E

Run end-to-end tests:

```sh
pnpm turbo e2e
```

This runs:

- `e2e:playwright` - Executes Playwright E2E tests (depends on `build`)

### Development Tasks

#### Dev

Start the development server:

```sh
pnpm turbo dev
```

#### Preview

Preview the production build locally:

```sh
pnpm turbo preview
```

#### Storybook

Start Storybook development server:

```sh
pnpm turbo storybook
```

Build Storybook for production:

```sh
pnpm turbo build:storybook
```

### Git Hooks

#### Pre-commit

The pre-commit hook automatically runs before each commit:

```sh
pnpm turbo pre-commit
```

This runs:

- `fix-staged-fast` - Formats only staged files with Prettier (fast, non-blocking)

The hook is configured via Husky and runs automatically on `git commit`. You can also run it manually using the command above.

### Tool-Specific Tasks

You can also run individual tool-specific tasks directly:

```sh
# Build tasks
pnpm run build:svelte
pnpm run build:storybook

# Check tasks
pnpm run check:prettier
pnpm run check:eslint
pnpm run check:typescript
pnpm run check:svelte

# Fix tasks
pnpm run fix:prettier
pnpm run fix:eslint

# Test tasks
pnpm run test:vitest
pnpm run e2e:playwright
```

## Project Structure

```
skills-verifier/
├── src/
│   ├── lib/
│   │   ├── clients/           # Shared clients (browser + server safe)
│   │   │   └── framework-client/   # Framework/skill API client
│   │   ├── components/
│   │   │   ├── app-header/    # App navigation header
│   │   │   ├── theme-toggle/  # Light/dark/system theme switcher
│   │   │   └── ui/            # shadcn-svelte components
│   │   ├── pages/             # Page-level components
│   │   ├── server/            # Server-only code
│   │   │   ├── services/      # Time, ID, and other services
│   │   │   │   ├── time-service/
│   │   │   │   └── id-service/
│   │   │   └── util/provider/ # Provider context system (ALS)
│   │   │       ├── providers.ts
│   │   │       ├── provider-ctx.ts
│   │   │       └── README.test.ts
│   │   └── utils.ts
│   ├── routes/                # SvelteKit routes
│   │   ├── +layout.svelte    # Root layout with header
│   │   ├── +page.server.ts   # Home redirect
│   │   └── jobs/create/       # Create job page
│   ├── app.d.ts
│   └── hooks.server.ts        # Request context setup
├── docs/
│   └── ideas/                 # Future enhancement ideas
├── e2e/                       # End-to-end tests
├── .storybook/                # Storybook configuration
├── .vscode/                   # VS Code settings and launch configs
├── static/                    # Static assets
└── turbo.jsonc                # Turborepo configuration
```

## Architecture

### Provider Context System

This project uses a lightweight dependency injection system built on AsyncLocalStorage (ALS):

- **Providers** – Composable functions that return context slices (e.g., `TimeServiceCtx`, `IdServiceCtx`)
- **Provider chains** – `Providers(a, b, c)` merges slices into a full context
- **Entry points** – `runInContext(ctx, fn)` or `runWithProvider(chain, fn)` for tests
- **Server requests** – `hooks.server.ts` wraps each request in dev app context
- **Safe access** – `providerCtx<T>()` reads from ALS; throws if no context

Example service slice pattern:

```typescript
// Service factory returns the narrow service
export function FakeTimeService(): TimeService { ... }

// Context slice wraps it for the provider chain
export const FakeTimeServiceCtx = () =>
  ({ timeService: FakeTimeService() }) satisfies TimeServiceCtx;
```

See `src/lib/server/util/provider/README.test.ts` for full examples.

### Browser vs Server Code

- **`src/lib/clients/`** – Code safe for browser and server (e.g., framework client)
- **`src/lib/server/`** – Server-only code (services, provider system, app context)
- **`createFrameworkService()`** – Creates client env-aware; safe to call anywhere
- **`getFrameworkClient()`** – Server-only helper that reads from request ALS

### Credential verification & the LearnCard embed variant

A match page starts a DCC verify exchange and, by default, shows a QR (plus an "open on this
device" interaction-URL link). Wallets post a Verifiable Presentation to the exchange's VC-API
endpoint (`vcapi`); the server polls for a terminal result and persists the returned credentials.
Both `complete` **and** `invalid` results are passed through — an applicant can build a match from
credentials that carry verification warnings or failures, with each problem surfaced honestly rather
than dead-ending (see `docs/adr/2026-07-12-forgiving-invalid-verification-results.md`).

The match page also supports an **embed variant** for running inside the LearnCard app store:

- Open the page with `?embed=learncard-partner-connect`. Instead of the QR it renders a **Request
  from LearnCard** button (using [`@learncard/partner-connect`](https://docs.learncard.com/sdks/partner-connect))
  plus an **Open another wallet** link. The interaction-URL link is always available as a fallback.
- The SDK is dynamically imported (browser-only) in `src/lib/clients/learncard/partner-connect-client.ts`
  and returns the VP in-browser. That VP is **not trusted client-side**: it is relayed to a
  capability-authorized endpoint (`POST /jobs/[id]/match/[matchId]/present`) which forwards it to the
  DCC transaction service for the same server-side verification the QR flow uses. The presentation is
  signed against the exchange's own `challenge`/`domain`, surfaced from the `startExchange` action.
- `PUBLIC_LEARNCARD_HOST_ORIGIN` is the **default/fallback** LearnCard host origin the SDK trusts
  (default `https://learncard.app`). See `.env.example`.
- **Launch-URL repair + host-origin precedence.** LearnCard launches the iframe with a malformed
  URL — it appends its host hint with a stray second `?` (not `&`), e.g.
  `/jobs?embed=learncard-partner-connect?lc_host_override=https://learncard.app`. `readEmbedLaunchParams`
  (in `embed-launch-params.ts`) normalizes the stray `?`→`&` at the parse boundary so both `embed`
  and `lc_host_override` are recovered. A recovered **valid https** `lc_host_override` (any https
  origin, incl. white-label hosts — no allowlist) is remembered for the session and used as the
  partner-connect `hostOrigin`, overriding the env default; a non-https/absent override keeps the
  default. Accepting any https origin is a deliberate posture: credential _verification_ stays
  server-side (the VP is relayed and re-verified per the 2026-07-07 embed-relay ADR), so a hostile
  embedder cannot inject verified credentials.

> **Out of scope / deployment note:** actually embedding the page inside LearnCard's iframe/webview
> requires relaxing frame-ancestors (CSP `frame-ancestors` / `X-Frame-Options`) at the hosting layer.
> This app does not set those headers; configure them in infra when enabling the embed in production.

## Technology Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn-svelte
- **UI Components**: shadcn-svelte (bits-ui, tailwind-variants)
- **Theming**: Light/dark/system mode (custom, no mode-watcher)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Component Development**: Storybook
- **Task Runner**: Turborepo
- **Code Quality**: ESLint, Prettier, svelte-check
- **Git Hooks**: Husky, lint-staged

## Contributing

1. Make your changes
2. Run checks: `pnpm turbo check`
3. Fix any issues: `pnpm turbo fix`
4. Run tests: `pnpm turbo test`
5. Commit (pre-commit hook will format staged files automatically)

## License

[Add license information]
