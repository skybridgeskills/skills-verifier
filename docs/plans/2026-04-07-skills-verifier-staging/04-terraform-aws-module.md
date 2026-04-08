# Phase 4: Publishable Terraform module (`terraform/skills-verifier/aws/`)

## Scope of phase

In **`skybridgeskills-monorepo`**, create **`terraform/skills-verifier/aws/`** (parallel to **`terraform/osmt/aws/`**) provisioning **DynamoDB**, **ECS Fargate** on the **existing SBS cluster**, **dedicated ALB**, **Route53**, **security groups**, **IAM**, **CloudWatch logs**, and ALB health check on **`/health`**.

Mirror **OSMT** layout and data sources: **`data.aws_vpc.sbs`**, **`data.aws_ecs_cluster.sbs`**, **`data.aws_subnets.private` / `public`**, **`data.aws_acm_certificate.wildcard`**, **`var.config`** shape compatible with staging (copy variable typing pattern from **`terraform/osmt/aws/variables.tf`** and **`locals.tf`** as needed).

## Code Organization Reminders

- Prefer granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

**Sizing (per product decision):** **`desired_count = 2`**, **small** Fargate CPU/memory (e.g. **256 CPU / 512 MiB** or next step up if Node needs headroom — validate under load).

**Task definition env (non-exhaustive):**

- **`CONTEXT=aws`**
- **`DYNAMODB_TABLE`** = table resource name
- **`AWS_REGION`** = data.aws_region.current
- **`CREDENTIAL_ENGINE_API_KEY`** = from variable (sensitive)
- **`CREDENTIAL_ENGINE_SEARCH_URL`** = derived from **`credential_engine_registry_url`** (trim trailing slash, append **`/assistant/search/ctdl`** or match handbook if host already includes path — add **`locals`** with **`replace`** / validation)
- **`HOST=0.0.0.0`**, **`PORT`** = container port exposed to TG
- Optional: **`LOG_LEVEL`**

**Networking:** Tasks in **private** subnets with egress to CE and AWS APIs; ALB in **public** subnets; SG rules ALB → task port only.

**ECR:** Either **data source** for existing repo (created manually or by wrapper first run) or **`aws_ecr_repository`** in module — align with OSMT (check whether OSMT creates ECR or assumes it exists). Image URI passed as **variable** **`container_image`** (full digest or tag string).

**Lifecycle:** Consider **`ignore_changes = [task_definition]`** on **`aws_ecs_service`** if deployments are pushed outside Terraform (OSMT pattern); document in module README.

**Outputs:** ALB DNS name, service name, table name, useful for debugging.

**Publish:** Terraform Cloud private module **`skills-verifier/aws`** from **`skybridgeskills-monorepo/terraform/skills-verifier/aws`** (same process as **`osmt/aws`**).

## Tests

- **`terraform fmt -recursive`**
- **`terraform validate`** in module directory with mock **`-var-file`** or CI stub (optional).

## Validate

From **`monorepo/terraform/skills-verifier/aws/`** (with backend disabled or local):

```bash
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```
