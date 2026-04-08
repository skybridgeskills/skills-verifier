# Phase 6: GitHub Actions (build and push)

## Scope of phase

In the monorepo at **`/Users/yona/dev/skybridge/feature/verifier/monorepo`**, add a reusable workflow **`skills-verifier-build.yml`** modeled on **`.github/workflows/osmt-build.yml`**: checkout, **AWS OIDC or keys** (same as OSMT), **ECR login**, run **`update-source.sh`**, **`docker-build.sh --push`**, summary with image URI.

Update **`.github/workflows/main-push.yml`** to detect changes under **`wrappers/skills-verifier/`** and invoke the workflow (mirror **`osmt-check-changes`** / **`osmt-build`** job pattern).

## Code Organization Reminders

- Prefer granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

- Reuse **same AWS account/region** and **IAM** assumptions as **`osmt-build.yml`** unless verifier should use a different ECR repo name (document in workflow comments).
- Ensure **`skills-verifier`** ECR repository exists (create in Terraform module, one-off AWS console, or workflow — align with phase 4).

## Tests

- Merge a PR that touches **`wrappers/skills-verifier/`** and confirm workflow runs (or dry-run in fork).

## Validate

Successful workflow run producing a tagged image in ECR; image digest/tag recorded for **`terraform apply`** / module variable.
