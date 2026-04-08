# Plan notes: skills-verifier staging

## Local worktrees

For **monorepo** and **infra** edits, use:

- **`/Users/yona/dev/skybridge/feature/verifier/monorepo/`** — wrappers, GitHub Actions (`skybridgeskills-monorepo`).
- **`/Users/yona/dev/skybridge/feature/verifier/infra/`** — `environments/staging`, etc.

The **skills-verifier** **application** lives in this repo; **Terraform** lives in **`monorepo/terraform/skills-verifier/aws/`** (same pattern as **`terraform/osmt/aws/`**).

## Scope of work

Deploy **skills-verifier** (SvelteKit app) to **AWS staging** with:

- **ECS on Fargate**: ~**2 tasks**, **small** CPU/memory (user expectation: low load).
- **DynamoDB**: single-table design already described in-repo (`terraform/dynamodb.tf`); app must **actually use** Dynamo in `CONTEXT=aws` when configured (today storage is always in-memory).
- **Ingress**: **Dedicated public ALB** (OSMT-style), HTTPS, Route53 (or equivalent) records — **staging:** `verifier.staging.prettygoodskills.com`; **production (later):** `verifier.prettygoodskills.com`.
- **IAM**: task role for DynamoDB (and any other AWS APIs the app uses).
- **Secrets / config**: Credential Engine (`CREDENTIAL_ENGINE_SEARCH_URL`, `CREDENTIAL_ENGINE_API_KEY`) required for `CONTEXT=aws`; likely SSM Parameter Store or Secrets Manager (OSMT staging uses sensitive TF variables feeding the module).
- **Container image**: build and push (ECR) via the **monorepo wrapper pattern** (see `skybridgeskills-monorepo/wrappers/README.md`): add `wrappers/skills-verifier/` with `VERSION`, `update-source.sh` (checkout of this app repo into gitignored `source/`), `docker-build.sh`, Dockerfile — same orchestration as OSMT; CI in monorepo (e.g. workflow parallel to `osmt-build.yml`). App repo still needs **`@sveltejs/adapter-node`** (or equivalent) so the wrapper build produces a runnable Node image.
- **Wire into staging Terraform**: `infra/environments/staging/main.tf` adds **`module.skills_verifier`** sourced from **`app.terraform.io/skybridgeskills/skills-verifier/aws`**, published from **`monorepo/terraform/skills-verifier/aws/`** (OSMT parity).
- **Version endpoint**: **`GET /version`** — JSON aligned with OSMT’s **`version.json`** (**`version`** = skills-verifier source baked at image build; **`extra.sbsMonorepoVersion`** when built via monorepo wrapper / **`docker-build.sh`**).

Out of scope unless you say otherwise: production environment, autoscaling beyond fixed desired count, multi-region.

## Current state of the codebase (skills-verifier)

| Area                  | State                                                                                                                                                                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime context**   | `CONTEXT=aws` in `aws-app-context.ts` wires CE, real logger, real IDs, **but** `StorageDatabaseCtx` always calls `createStorageDatabase()` which **always** returns `MemoryDatabase`. If `DYNAMODB_TABLE` is set, it **logs a warning** and still uses memory (`storage-database-factory.ts`). |
| **DynamoDB queries**  | Domain queries implement `dynamo` branches using `@aws-sdk/lib-dynamodb`; `DynamoStorageDatabase` type exists; **no factory path** builds `{ $type: 'dynamo', docClient, tableName }`.                                                                                                         |
| **Terraform snippet** | `terraform/dynamodb.tf` defines `skills-verifier-${var.environment}` table + GSI1; suitable as a **submodule** or copy into a larger module.                                                                                                                                                   |
| **Deploy artifact**   | `svelte.config.js` uses `@sveltejs/adapter-auto`; **no Dockerfile**.                                                                                                                                                                                                                           |
| **Docs**              | `docs/deployment.md` / `docs/architecture.md` state Dynamo is stubbed.                                                                                                                                                                                                                         |

## Reference: OSMT + staging

When working locally, substitute **`/Users/yona/dev/skybridge/feature/verifier/monorepo`** and **`…/infra`** for the paths below.

- **`…/monorepo/terraform/osmt/aws/`** (published as `osmt/aws`): Full ECS Fargate task definition, ALB, security groups, IAM, RDS, etc. (heavier than verifier needs — no Redis/ES for verifier).
- **`…/monorepo/terraform/skills-verifier/aws/`** (published as `skills-verifier/aws`): Verifier ECS + ALB + DynamoDB (this plan).
- **`…/monorepo/wrappers/osmt/`**: OSMT **does not live in the monorepo**; the wrapper holds Dockerfile + scripts; **source** is fetched into `wrappers/osmt/source/` by `update-source.sh` (see `wrappers/README.md`). **skills-verifier should mirror this**: wrapper in monorepo, source = this repository.
- **`…/infra/environments/staging/main.tf`**: Terraform Cloud workspace `skybridgeskills-staging_environment-staging`; instantiates `module.skybridgeskills` and `module.osmt` with shared `var.config` and secrets.

## Questions (to resolve in order)

Answers will be recorded below as we go.

### 1. Terraform module placement

**Question:** Where should skills-verifier AWS resources live long-term?

**Context:** OSMT uses a **published Terraform module** (`app.terraform.io/skybridgeskills/osmt/aws`). Staging only **calls** modules. skills-verifier could follow the same pattern (new module repo/path + registry version), or be inlined under `infra`, or folded into `sbs`.

**Suggested default:** Module under **`skybridgeskills-monorepo/terraform/skills-verifier/aws/`**, published like **`terraform/osmt/aws`**, then `module "skills_verifier"` in `infra/environments/staging/main.tf`.

**Answer:** Same pattern as OSMT — **Terraform module in the monorepo** at **`terraform/skills-verifier/aws/`**, published to Terraform Cloud, consumed from staging **`main.tf`**.

### 2. DNS and load balancing

**Question:** How should users reach staging skills-verifier (hostname, path, shared ALB vs dedicated ALB)?

**Context:** OSMT uses a public ALB with HTTPS and target group health check on `/health`. skills-verifier needs a comparable health route and listener rule.

**Suggested default:** Dedicated hostname under existing staging public zone with a **new ALB** per app where that matches OSMT.

**Answer:** Hostnames — **staging:** `verifier.staging.prettygoodskills.com`, **prod:** `verifier.prettygoodskills.com`. Use a **dedicated ALB** for verifier (fits OSMT pattern); module should accept hostname / cert inputs per environment.

### 3. DynamoDB on first cut

**Question:** Is **persistent DynamoDB required for the first staging deploy**, or acceptable to ship ECS first with memory-only and enable Dynamo in a follow-up?

**Context:** User asked for Dynamo; app code still forces memory.

**Suggested default:** **Include Dynamo + IAM + app wiring in the same rollout** so staging matches production behavior and data survives task restarts.

**Answer:** **(A)** — DynamoDB + app wiring in the **first** staging deploy.

### 4. Credential Engine credentials

**Question:** Should staging verifier **reuse** the same Credential Engine secrets as OSMT (`credential_engine_api_key` / registry URL pattern) or use **dedicated** parameters for verifier?

**Context:** Staging already has CE-related variables for OSMT.

**Suggested default:** **Dedicated SSM parameters** (or separate TF variables) for verifier so key rotation and access scoping do not couple two apps unless you intentionally want one key.

**Answer:** **Reuse the existing staging CE inputs** (`credential_engine_api_key`, `credential_engine_registry_url`, etc.) and pass the same values into the skills-verifier module. The verifier module/task should set `CREDENTIAL_ENGINE_API_KEY` from the shared key and derive **`CREDENTIAL_ENGINE_SEARCH_URL`** from `credential_engine_registry_url` (e.g. canonical `…/assistant/search/ctdl` on that host) so the app’s search client matches [`docs/deployment.md`](../../deployment.md).

### 5. CI/CD for images

**Question:** Where should the Docker image be built and pushed (which pipeline/registry naming convention)?

**Context:** Like OSMT, the **deployable artifact is built from `skybridgeskills-monorepo`**: wrapper under `wrappers/<app>/`, monorepo git tag for image version, `docker-build.sh --push`, and a workflow such as `osmt-build.yml` when `wrappers/osmt/` changes. Upstream source is **not** the monorepo; it is checked out by script.

**Suggested default:** Add **`wrappers/skills-verifier/`** in the monorepo (VERSION + update-source pointing at the skills-verifier GitHub repo + Dockerfile + docker-build.sh), ECR image name aligned with OSMT conventions (e.g. `skills-verifier:<monorepo-version>`), and extend **`main-push.yml`** (or equivalent) with a change-detection + reusable workflow call mirroring OSMT.

**Answer:** **Follow the OSMT wrapper pattern** — image build and push from **skybridgeskills-monorepo** (`wrappers/skills-verifier/`), not a standalone GHA-only pipeline in the app repo alone.

---

# Answers (filled during Q&A)

1. **Terraform placement:** Same as OSMT — module in **`skybridgeskills-monorepo/terraform/skills-verifier/aws/`**, published `skills-verifier/aws`, pinned in staging.
2. **DNS / ALB:** Dedicated ALB; **staging** FQDN `verifier.staging.prettygoodskills.com`; **production** FQDN `verifier.prettygoodskills.com` (module parameterized so both workspaces can reuse it).
3. **DynamoDB:** Include in the **first** staging rollout (table, task IAM, and app `createStorageDatabase` wiring for `CONTEXT=aws`).
4. **Credential Engine:** Reuse existing staging `credential_engine_*` variables (same as OSMT); verifier module maps registry URL → `CREDENTIAL_ENGINE_SEARCH_URL` and key → `CREDENTIAL_ENGINE_API_KEY`.
5. **Image CI/CD:** Monorepo **wrapper** (`wrappers/skills-verifier/`) + monorepo workflows (pattern: `osmt-build.yml` / `main-push.yml`); ECR tagging consistent with OSMT (`skills-verifier:<version>` or team convention).

# Notes

- OSMT SSM params are **namespaced** (`osmt_credential_engine_*`); verifier can inject the same **values** via task env/SSM without renaming the staging root variables.
- **OSMT upstream** lives in `github.com/skybridgeskills/osmt`; **skills-verifier** stays its own git repo — only the **wrapper + Terraform publication workflow** align with OSMT’s split.
- **Monorepo + infra** for this feature: **`/Users/yona/dev/skybridge/feature/verifier/`** (`monorepo/`, `infra/`).
