# Open design questions

Decisions deferred while the app architecture stabilizes. Update this file when something is resolved (and link to ADRs or PRs if you use them).

## Data persistence

**Current choice:** The runtime uses an **in-memory database only**. `createStorageDatabase()` always returns `MemoryDatabase`; DynamoDB wiring in the factory is disabled until we need production persistence. Query modules still carry DynamoDB implementations so turning the cloud path back on is mostly a factory/env change plus validation.

**When revisiting:** Re-enable the factory branch that reads `DYNAMODB_TABLE` (or gate on `CONTEXT=aws`), keep Terraform/table design aligned with query key patterns, and document local testing (e.g. [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) or LocalStack).

## Frameworks vs skills on jobs

**Tension:** The product direction is to **attach skills directly to jobs** without treating “pick a competency framework first” as the primary model. The codebase still has:

- Domain: `JobResource` / `CreateJobParams` include a `frameworks` array alongside `skills`.
- UI: create-job flow uses `FrameworkSelector` + `SkillsList` (load framework JSON-LD, then pick skills).
- Server context: `frameworkClient` for Credential Engine–style fetches.

**Ways we could handle frameworks (pick one path when we implement):**

1. **Skills-only domain** — Remove `frameworks` from persisted job shape; UI is a skill picker (search, tags, or curated list). Optionally keep `frameworkUrl` or publisher metadata **on each skill** for traceability without a top-level `frameworks[]` on the job.
2. **Optional framework metadata** — Keep `frameworks` as an optional, denormalized hint (e.g. “these skills came from framework X”) for display or analytics, but not required for creation.
3. **Browse-only frameworks** — Keep `FrameworkClient` for **discovery** (user searches Credential Engine, picks competencies) but do not require a single “selected framework” row on the job; persist only the chosen skill records.

**Suggested default when we implement:** (1) or (3) — align persisted model with “skills on job” and simplify the create-job UI accordingly; avoid duplicating framework objects on every job unless there is a clear consumer.

Until then, new work should avoid deepening the framework-first UX unless explicitly needed.

## Match identity / ownership

**Current choice:** A match is identified by a **capability URL only** — anyone who holds the link
(`/jobs/{jobId}/match/{matchId}`) can view and act on that match. There is no session, account, or
ownership check; the `// IDENTITY (fast-follow)` seam comments mark where ownership/session would
attach (the `createMatch` action and the match `load`).

**When revisiting:** A **fast-follow plan** will harden identity — likely cookie-scoped "my matches",
optional accounts, and employer-visible submissions. The seam comments are the integration points.

## Verification exchange integration

**Current choice:** Credential verification is **poll-only** via the DCC `dcc-transaction-service`
verify workflow (VC-API + QueryByExample). The server creates an exchange, hands the wallet an
interact URL (rendered as a QR code), and the browser polls a server endpoint that proxies the VC-API
status; the provider's `vcapi`/`exchangeId` are read from the persisted match server-side and never
trusted from the client. **OID4VP is not supported upstream**, so it is intentionally out of scope.

**When revisiting:** If/when the transaction service adds OID4VP (or push/callback completion), we can
add a non-polling completion path; until then polling is the only integration mode.
