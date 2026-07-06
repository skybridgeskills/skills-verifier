# ADR: Verify-exchange client authenticates with Bearer, not Basic

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Skybridge Skills
- **Supersedes:** `2026-06-06-dcc-verify-exchange-provider.md` (auth-scheme detail only)
- **Superseded by:** None

## Context

`HttpVerificationExchange` (the `Http` adapter for the DCC verify workflow)
originally sent HTTP Basic auth — `Authorization: Basic base64(tenantName:token)`
— derived from `TRANSACTION_SERVICE_TENANT` and `TRANSACTION_SERVICE_TOKEN`
(recorded in `2026-06-06-dcc-verify-exchange-provider.md`).

In staging this produced a 401 at exchange creation:

```
VerificationExchangeError: Transaction service returned 401
cause: {"code":401,"message":"Improperly formatted Bearer token"}
```

Investigation across the monorepo showed:

- The deployed standalone `dcc-transaction-service`
  (`transactions.<env>.prettygoodskills.com`) is **Bearer-only**: it rejects any
  `Authorization` header that does not start with `Bearer ` before performing any
  tenant check. `Basic …` is rejected outright with the message above.
- The sibling consumer `ler-tests` already authenticates with
  `Authorization: Bearer <token>` and works.
- Token values and tenant name were already wired correctly (shared
  `random_password` provisions both `TENANT_TOKEN_SKILLS_VERIFIER` on the service
  and `TRANSACTION_SERVICE_TOKEN` on this app). The failure was purely the auth
  scheme.

## Decision

The verify-exchange `Http` adapter sends `Authorization: Bearer <token>` (the raw
`TRANSACTION_SERVICE_TOKEN`) when a token is configured, and no `Authorization`
header when it is not.

- The tenant continues to be scoped by `variables.tenantName` in the request
  body; the raw token also reverse-maps to the tenant server-side, so the
  `tenant:` prefix used by the old Basic credential is unnecessary.
- The header is still never logged. Because a Bearer header value equals the raw
  token by design, the previous unit assertion that the header did not contain
  the raw token (only meaningful for base64-obfuscated Basic) was removed.

## Consequences

- skills-verifier can create verify exchanges against the deployed Bearer-only
  transaction service, matching `ler-tests`.
- Bearer is compatible with both the deployed service and the newer
  `dcc-transaction-service` fork (which accepts Basic and Bearer), so this is
  forward- and backward-compatible.
- Only the auth-scheme detail of the 2026-06-06 ADR is superseded; the rest of
  that decision (provider pattern, poll-only completion, server-proxied polling)
  stands.

## Alternatives Considered

- **Keep Basic and roll the deployed service forward to the Basic+Bearer fork.**
  Rejected as the primary fix: it depends on an infra/image rollout, whereas
  sending Bearer fixes the client directly and works regardless of which service
  build is deployed.
