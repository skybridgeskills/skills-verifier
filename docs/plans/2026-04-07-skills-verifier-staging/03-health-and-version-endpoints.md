# Phase 3: Health and version endpoints

## Scope of phase

Add two lightweight HTTP routes for operations and parity with OSMT:

1. **`GET /health`** — **200** for ALB target health checks (no external I/O).
2. **`GET /version`** — JSON **version manifest** aligned with OSMT’s **`version.json`** shape: **`version`** identifies the **skills-verifier source** revision baked into the image; **`extra.sbsMonorepoVersion`** is set **only** when the image is built from **`skybridgeskills-monorepo`** (wrapper passes monorepo tag/version from **`scripts/print-app-version.sh`**). When absent or empty, **`extra`** may be `{}` or omit the field — same semantics as OSMT when not a monorepo-built artifact.

Reference: OSMT **`GET /version`** and wrapper **`version.json`** injection ([`wrappers/osmt/README.md`](https://github.com/skybridgeskills/skybridgeskills-monorepo/blob/main/wrappers/osmt/README.md)); Dockerfile build-args **`OSMT_VERSION`**, **`SBS_MONOREPO_VERSION`**, timestamps.

## Code Organization Reminders

- Prefer granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

### `/health`

- **`src/routes/health/+server.ts`** — GET returns **200** + minimal body (e.g. **`{ "ok": true }`**).
- Terraform target group (phase 4) keeps **`path = "/health"`**.

### `/version`

- **`src/routes/version/+server.ts`** (or **`+server.ts`** under **`routes/version/`**) — GET returns **`application/json`**.
- **Suggested JSON shape** (mirror OSMT, adapt names as needed):

```json
{
	"version": "<skills-verifier source ref>",
	"buildTimestamp": "<optional ISO UTC>",
	"buildTimestampPT": "<optional Pacific label>",
	"extra": {
		"sbsMonorepoVersion": "<set when built from monorepo wrapper>"
	}
}
```

- **Runtime source of truth:** values set at **image build** (Docker **`ARG` → `ENV`**). Read in the handler via **`process.env`** (simplest for arbitrary keys) or **`$env/dynamic/private`** if your Kit config exposes them:
  - **`SKILLS_VERIFIER_VERSION`** (or **`APP_VERSION`**) — required in production images; from **git / `VERSION`** in checked-out **`source/`** during **`docker-build.sh`** (e.g. run **`./scripts/print-app-version.sh`** inside the source tree, or pass commit from **`wrappers/skills-verifier/VERSION`**).
  - **`SBS_MONOREPO_VERSION`** — optional; set from monorepo root **`scripts/print-app-version.sh`** in **`docker-build.sh`** (same pattern as OSMT’s **`SBS_MONOREPO_VERSION`**).
  - **`BUILD_TIMESTAMP`**, **`BUILD_TIMESTAMP_PT`** — optional; match OSMT if you want identical observability fields.
- **Local dev:** when build-time env vars are unset, fall back to existing **`getAppVersion()`** from [`app-version.ts`](../../../src/lib/server/util/app-version.ts) and **`extra: {}`** so **`pnpm dev`** still returns a sensible response.

### Security

- Response must **not** include secrets. Version strings and monorepo tag only.

## Tests

- Unit or integration test: handler returns **200**, JSON includes **`version`**, and **`extra.sbsMonorepoVersion`** present when env is set in test setup.
- Manual: **`curl /version`** after **`node build`** with env vars exported.

## Validate

```bash
pnpm check
CONTEXT=test pnpm test:vitest
```
