# Phase 5: Monorepo wrapper (`wrappers/skills-verifier/`)

## Scope of phase

In the **monorepo** checkout at **`/Users/yona/dev/skybridge/feature/verifier/monorepo`**, add **`wrappers/skills-verifier/`** following **`wrappers/README.md`** in that repo and mirroring **`wrappers/osmt/`** ergonomics:

- **`VERSION`** — commit/tag of skills-verifier repo to checkout
- **`update-source.sh`** — clones or updates **`source/`** (gitignored) from the canonical GitHub remote
- **`docker-build.sh`** — build from **monorepo root**; support **`--push`** to ECR (and Docker Hub if team still mirrors OSMT)
- **`Dockerfile`** — multi-stage: install **pnpm**, copy **`source/`**, **`pnpm install --frozen-lockfile`**, **`pnpm build`**, production stage runs **`node build/index.js`** (exact path per adapter-node output)
- **`WRAPPER.md`** — how to bump VERSION, build locally, and relationship to Terraform image variable

## Code Organization Reminders

- Prefer granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

- Build context: **monorepo root** — e.g. **`cd /Users/yona/dev/skybridge/feature/verifier/monorepo`** before **`./wrappers/skills-verifier/docker-build.sh`** (same as OSMT **`docker-build.sh`** requirement).
- Image name: align with **`osmt-build.yml`** ECR naming — e.g. **`…/skills-verifier:${VERSION}`** where version comes from monorepo git describe / tag script (copy **`osmt`** pattern from **`wrappers/osmt/docker-build.sh`**).
- Node version: match **`.nvmrc`** / **`package.json`** **`engines`** in skills-verifier if present.

### Version metadata (OSMT parity, feeds **`GET /version`**)

Mirror **`wrappers/osmt/docker-build.sh`** and Dockerfile **`ARG`/`ENV`**:

- **`SBS_MONOREPO_VERSION`** — from monorepo root **`scripts/print-app-version.sh`** (same as OSMT **`SBS_MONOREPO_VERSION`** scalar).
- **Skills-verifier source version** — from **`source/`** after checkout: run **`./scripts/print-app-version.sh`** inside **`source/`**, or use abbreviated commit of **`wrappers/skills-verifier/VERSION`**; pass as Docker build-arg (e.g. **`SKILLS_VERIFIER_VERSION`** / **`APP_VERSION`**) and **`ENV`** so the SvelteKit server can read it at runtime.
- Optional: **`BUILD_TIMESTAMP`**, **`BUILD_TIMESTAMP_PT`** — same pattern as OSMT Dockerfile for **`version.json`** injection.
- **`docker build`** must pass **`--build-arg`** values; production image should **`ENV`** them so **`GET /version`** returns **`extra.sbsMonorepoVersion`** when non-empty (omit key or use empty string when local/non-monorepo build — match OSMT semantics).

**Smoke:** after build, run container and **`curl localhost:$PORT/version`** — expect **`version`** + non-empty **`extra.sbsMonorepoVersion`** for CI/monorepo builds.

## Tests

- Local: **`./wrappers/skills-verifier/docker-build.sh`** without push.
- Optional: run container locally with **`-e`** for **`CONTEXT=dev`** to sanity-check static assets (full **`aws`** stack not required for image smoke).

## Validate

Manual build from **`/Users/yona/dev/skybridge/feature/verifier/monorepo`**; fix until image starts and responds on mapped **PORT**.
