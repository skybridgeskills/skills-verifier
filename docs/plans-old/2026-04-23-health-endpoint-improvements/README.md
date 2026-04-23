# Health Endpoint Improvements Plan

Applies the observability-baseline M2 health check pattern from the monorepo to the skills-verifier repository.

## Goal

Add a `/health/ready` readiness probe endpoint that aggregates real dependency checks (Credential Engine API, DynamoDB), while keeping the existing `/health` (liveness) endpoint cheap and unchanged for ALB target health checks.

This directly addresses the CE API staging issue: when the CE API is broken (HTTP 400), the readiness check will reflect this as `DOWN` status with a 503 HTTP response.

## Plan structure

| Phase                                                          | File                   | Scope                                                       | Parallel with |
| -------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------- | ------------- |
| [00-notes.md](00-notes.md)                                     | —                      | Analysis, questions, decisions                              | —             |
| [00-design.md](00-design.md)                                   | —                      | Design overview, file structure, architecture               | —             |
| [01-core-abstractions.md](01-core-abstractions.md)             | `health/*.ts`          | `HealthCheckSym`, `HealthRegistry`, `provideHealthRegistry` | —             |
| [02-per-dep-check-factories.md](02-per-dep-check-factories.md) | `health/checks/*.ts`   | `DynamoDBHealthCheck`, `HttpHealthCheck`                    | 3             |
| [03-readiness-response.md](03-readiness-response.md)           | `health/*.ts`          | `ReadinessResponse`, `buildReadinessResponse`               | 2             |
| [04-service-wiring.md](04-service-wiring.md)                   | `*service*.ts`         | Add `[HealthCheckSym]` to CE service, storage               | 5             |
| [05-readiness-adapter.md](05-readiness-adapter.md)             | `routes/health/ready/` | SvelteKit handler + route                                   | 4             |
| [06-app-wiring.md](06-app-wiring.md)                           | `*-app-context.ts`     | Append `provideHealthRegistry` to chains                    | —             |
| [07-cleanup-validation.md](07-cleanup-validation.md)           | —                      | Final cleanup, validation, summary                          | —             |

## Quick start

```bash
# Run the full plan (sequential phases)
# Phase 1
cat docs/plans/2026-04-23-health-endpoint-improvements/01-core-abstractions.md
# ... execute ...

# Phases 2 and 3 in parallel
cat docs/plans/2026-04-23-health-endpoint-improvements/02-per-dep-check-factories.md
cat docs/plans/2026-04-23-health-endpoint-improvements/03-readiness-response.md

# Phases 4 and 5 in parallel
cat docs/plans/2026-04-23-health-endpoint-improvements/04-service-wiring.md
cat docs/plans/2026-04-23-health-endpoint-improvements/05-readiness-adapter.md

# Phase 6
cat docs/plans/2026-04-23-health-endpoint-improvements/06-app-wiring.md

# Phase 7 (cleanup)
cat docs/plans/2026-04-23-health-endpoint-improvements/07-cleanup-validation.md
```

## Key decisions

1. **Symbol-keyed pattern:** Services with external deps expose `[HealthCheckSym]` — matches monorepo, allows automatic discovery
2. **HTTP check behavior:** 2xx = UP, 5xx = DOWN, other = DEGRADED
3. **Keep `/health` unchanged:** Liveness stays cheap for ALB compatibility
4. **Registry cache TTL:** 5 seconds to bound dependency load

## Reference

- Monorepo roadmap: `/Users/yona/dev/skybridge/skybridgeskills-monorepo/docs/roadmaps/2026-04-20-observability-baseline/m2-health-checks/`
- Current CE API issue: Staging returns HTTP 400 (see terminal output in plan)
