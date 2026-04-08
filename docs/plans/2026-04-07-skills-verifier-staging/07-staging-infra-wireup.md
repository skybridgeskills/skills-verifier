# Phase 7: Staging environment module call

## Scope of phase

Update **`/Users/yona/dev/skybridge/feature/verifier/infra/environments/staging/main.tf`** (and **Terraform Cloud** workspace variables if needed) to:

1. Add **`module "skills_verifier"`** (or agreed name) sourcing **`app.terraform.io/skybridgeskills/skills-verifier/aws`** (exact registry address per your TFC module registry naming).
2. Pass **`var.config`** (same object as **`module.osmt`**).
3. Pass **`credential_engine_api_key`**, **`credential_engine_registry_url`** (and any other required module inputs).
4. Pass **`container_image`** = ECR URI + tag built in phase 6.
5. Pass **FQDN** / hosted zone inputs so the record is **`verifier.staging.prettygoodskills.com`** (module may derive from **`config`** + literal **`verifier`** — follow OSMT **`locals`** for **`base_domain`**).

## Code Organization Reminders

- Prefer granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

- **Apply order:** publish Terraform module (phase 4) → build/push image (phases 5–6) → set **`container_image`** variable in TFC → **`terraform apply`** staging workspace.
- If **`lifecycle.ignore_changes`** is set on task definition, document how ECS service picks up new images (deployment script vs manual force-new-deployment — compare **`osmt-deploy.yml`**).

## Tests

- **`terraform plan`** in staging workspace shows expected creates/updates only.
- Post-apply: **`curl -I https://verifier.staging.prettygoodskills.com/health`** returns **200**.

## Validate

```bash
cd /Users/yona/dev/skybridge/feature/verifier/infra/environments/staging
terraform plan
```

(Or equivalent via **Terraform Cloud** UI for that workspace.)

After apply: smoke HTTPS + health + one UI page load.
