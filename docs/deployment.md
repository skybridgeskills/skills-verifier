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

- Both CE variables are **required** via Zod validation at startup. The app fails fast if they are missing or empty.
- Both framework client and skill search always use real implementations.

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

## Storage

Currently, all environments use **in-memory storage**. DynamoDB support is stubbed but disabled until production persistence is required. When enabled, `aws` context will likely use DynamoDB while `dev` and `test` continue using memory storage.
