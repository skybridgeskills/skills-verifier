# Phase 8: Cleanup, documentation, and validation

## Scope of phase

- **`skills-verifier/terraform/dynamodb.tf`** should remain a **pointer** to the monorepo module (no AWS resources in the app repo).
- Update **[`docs/deployment.md`](../../deployment.md)** and **[`docs/architecture.md`](../../architecture.md)** — DynamoDB no longer “stubbed” for **`aws`**; list required env vars for ECS; document **`GET /version`** (OSMT-style JSON, **`extra.sbsMonorepoVersion`** when image built from monorepo wrapper) and build-time **`ARG`/`ENV`** for version fields.
- Grep for **TODO** / debug / temporary staging notes introduced during the work.
- Final **`pnpm check`**, **`CONTEXT=test pnpm test:vitest`**, and any **Playwright** smoke you deem necessary.

## Cleanup & validation

- Search git diff for **TODO**, **FIXME**, **console.log** debug.
- Terraform: **fmt**, **validate**.

## Plan cleanup (when entire plan is done)

Per repo convention: add **`summary.md`** to this plan directory, move plan to **`docs/plans-done/`**, commit with **Conventional Commits**.

## Validate

```bash
pnpm check
CONTEXT=test pnpm test:vitest
```

```bash
terraform fmt -check -recursive
```

(Module path: **`monorepo/terraform/skills-verifier/aws/`**.)
