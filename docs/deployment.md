# Deployment configuration

How runtime configuration is chosen for Skills Verifier in different environments.

## Deployment context: explicit `CONTEXT`

**We do not infer “running on AWS” from the host** (for example `AWS_EXECUTION_ENV`, Lambda metadata, or similar). The app uses the same **explicit** pattern as the SkyBridge Skills monorepo backend: a required environment variable **`CONTEXT`** that is validated at startup (Zod discriminated union), and provider wiring branches on that value.

See `appMain` in `skybridgeskills-monorepo` (`sbs/packages/lib-backend/src/core/app-context/app-main.ts`) for the reference pattern (`aws`, `dev`, `memory`). Skills Verifier uses **`aws`**, **`dev`**, and **`test`** — **`test`** matches the _role_ of monorepo **`memory`** (deterministic, no external CE for skill search), but the literal value is **`test`** here.

**Why explicit**

- Predictable behavior in CI, containers, and local runs without guessing the platform.
- Clear failure when misconfigured (parse errors at boot) instead of silently picking the wrong adapter set.

Skills Verifier parses **`CONTEXT`** when building server `AppContext` and selects the skill search adapter as follows:

| `CONTEXT`  | Skill search adapter                                                             | Credential Engine vars                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **`aws`**  | Real (Registry Search API) only                                                  | **`CREDENTIAL_ENGINE_SEARCH_URL`** and **`CREDENTIAL_ENGINE_API_KEY`** are **required**; missing or empty values → **fail at startup**. |
| **`dev`**  | Real only if **both** CE vars are set (non-empty after trim); otherwise **fake** | Optional for local fake mode; set **both** to hit CE (e.g. sandbox URL + key).                                                          |
| **`test`** | **Always fake**                                                                  | Ignored for adapter selection (tests stay deterministic).                                                                               |

Further variables (framework client toggles, etc.) belong in **`.env.example`** and below.

## Skill search vs framework client

Skill search (new) and framework JSON-LD fetch (`PUBLIC_USE_FAKE_FRAMEWORK_SERVICE`) are **independent**. Either can be fake or real depending on env; see `.env.example` once the skill search variables land.

## Credential Engine (consuming) — Search API

Skill search uses the **Credential Registry Search API** (CTDL JSON queries over HTTP POST). Authoritative details: [Search API handbook](https://credreg.net/registry/searchapi).

### Environment variables (locked)

| Variable                       | Purpose                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CREDENTIAL_ENGINE_SEARCH_URL` | Full URL for **`POST`** search requests. **Required** whenever the real adapter runs (`aws`, or `dev` with both vars set). Typical values: sandbox `https://sandbox.credentialengine.org/assistant/search/ctdl`, production `https://apps.credentialengine.org/assistant/search/ctdl` (per [handbook](https://credreg.net/registry/searchapi)). |
| `CREDENTIAL_ENGINE_API_KEY`    | Registry Search API key (CE account approved for Search API). Send as **`Authorization: Bearer <key>`**. **Server-only** — never `PUBLIC_*` or client-side.                                                                                                                                                                                     |

Paths are under `/assistant/search/ctdl` on the registry host.
