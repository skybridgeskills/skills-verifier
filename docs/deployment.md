# Deployment configuration

How runtime configuration is chosen for Skills Verifier in different environments.

## Deployment context: explicit `CONTEXT`

**We do not infer "running on AWS" from the host** (for example `AWS_EXECUTION_ENV`, Lambda metadata, or similar). The app uses the same **explicit** pattern as the SkyBridge Skills monorepo backend: a required environment variable **`CONTEXT`** that is validated at startup (Zod discriminated union), and provider wiring branches on that value.

See `appMain` in `skybridgeskills-monorepo` (`sbs/packages/lib-backend/src/core/app-context/app-main.ts`) for the reference pattern (`aws`, `dev`, `memory`). Skills Verifier uses **`aws`**, **`dev`**, and **`test`** — **`test`** matches the _role_ of monorepo **`memory`** (deterministic, no external CE for skill search), but the literal value is **`test`** here.

**Why explicit**

- Predictable behavior in CI, containers, and local runs without guessing the platform.
- Clear failure when misconfigured (parse errors at boot) instead of silently picking the wrong adapter set.

## How services are selected by `CONTEXT`

| `CONTEXT`  | Framework client               | Skill search                   | Credential Engine vars required?          |
| ---------- | ------------------------------ | ------------------------------ | ----------------------------------------- |
| **`aws`**  | Real (HTTP)                    | Real (CE API)                  | **Yes** — missing/empty → fail at startup |
| **`dev`**  | Real if CE vars set, else fake | Real if CE vars set, else fake | Optional — set both to use real CE        |
| **`test`** | Fake                           | Fake                           | Ignored                                   |

**Behavior on `dev`:**

- If `CREDENTIAL_ENGINE_SEARCH_URL` and `CREDENTIAL_ENGINE_API_KEY` are both set (non-empty after trim), both framework client and skill search use the real Credential Engine Registry.
- If either CE var is missing or empty, both services use fake implementations (useful for offline development, Storybook, and testing without CE credentials).

**Behavior on `aws`:**

- `CREDENTIAL_ENGINE_SEARCH_URL`, `CREDENTIAL_ENGINE_API_KEY`, and **`DYNAMODB_TABLE`** are **required** (Zod). The app fails fast if they are missing or empty.
- **`AWS_REGION`** should be set for DynamoDB (Fargate usually provides it; otherwise set explicitly).
- Framework client and skill search always use real CE implementations; storage uses **DynamoDB** (`createStorageDatabase`).

**Behavior on `test`:**

- Deterministic fakes for all external services (time, IDs, framework client, skill search).
- CE variables are ignored.

## Credential Engine (consuming) — Search API

Skill search uses the **Credential Registry Search API** (CTDL JSON queries over HTTP POST). Authoritative details: [Search API handbook](https://credreg.net/registry/searchapi).

### Environment variables

| Variable                       | Purpose                                                                                                                                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CREDENTIAL_ENGINE_SEARCH_URL` | Full URL for **`POST`** search requests. **Required** on `aws`, optional on `dev`. Typical values: sandbox `https://sandbox.credentialengine.org/assistant/search/ctdl`, production `https://apps.credentialengine.org/assistant/search/ctdl` (per [handbook](https://credreg.net/registry/searchapi)). |
| `CREDENTIAL_ENGINE_API_KEY`    | Registry Search API key (CE account approved for Search API). Send as **`Authorization: Bearer <key>`**. **Server-only** — never `PUBLIC_*` or client-side.                                                                                                                                             |

Paths are under `/assistant/search/ctdl` on the registry host.

The server client sends the same JSON envelope as the [Query Helper](https://credreg.net/quickstart/queryhelper): `Query` (CTDL object), `Skip`, `Take`, and `Environment` (`Sandbox` when the URL host contains `sandbox`, otherwise `Production`). A flat body with only `search:skip` / `search:take` is not used.

## Storage

| `CONTEXT` | Storage                                                       |
| --------- | ------------------------------------------------------------- |
| `aws`     | **DynamoDB** (single-table; `DYNAMODB_TABLE` names the table) |
| `dev`     | In-memory                                                     |
| `test`    | In-memory                                                     |

## Operations HTTP

- **`GET /health`** — returns `200` for load balancer checks (no external calls).
- **`GET /version`** — JSON deploy metadata. **`version`** is usually **`SKILLS_VERIFIER_VERSION`** or **`APP_VERSION`** from the image build; **`extra.sbsMonorepoVersion`** is set when built via **`skybridgeskills-monorepo`** (`wrappers/skills-verifier` / `docker-build.sh`).

## Container runtime

Production builds use **`@sveltejs/adapter-node`** (`pnpm build:svelte` → `node build`). Default listen address **`HOST=0.0.0.0`**, **`PORT=3000`** unless overridden.
