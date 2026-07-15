# ADR: Admin auth via single-password login + HMAC session cookie

- **Status:** Accepted
- **Date:** 2026-07-15
- **Deciders:** Skybridge Skills
- **Supersedes:** None
- **Superseded by:** None

## Context

`skills-verifier` had no authentication of any kind — every route and action was
public (see the `// IDENTITY (fast-follow)` seams in the match flow). We needed a
lightweight admin capability so an operator can delete a job (and its cascade of
matches + job-apps) to clear test data, without exposing that destructive action
to the public.

This is a **standalone repo**: unlike the monorepo it has no `@repo/lib-backend`,
so the monorepo's `authClaimService` / `JwtClaimService` (which depend on
`jsonwebtoken` and a shared secret service) are not importable, and there is no
central config/secret service — env is read ad hoc by the per-`CONTEXT` context
builders.

Constraints and intent:

- One trusted operator, not a user base. No accounts, roles, or identity
  provider are needed now.
- The public site must stay fully usable without logging in.
- The solution should match the repo's conventions (factory functions,
  provider-injected services in `AppContext`, hexagonal storage) and add no new
  runtime dependency if avoidable.

## Decision

1. **Single shared password, from env.** Login at an unlisted `/auth` page checks
   a submitted password against `ADMIN_PASSWORD` using a timing-safe compare.
   There is no user record and no password hashing/rotation — the secret _is_ the
   env var. On `CONTEXT=aws` both `ADMIN_PASSWORD` and `AUTH_SECRET` are required
   (fail-fast); `dev`/`test` fall back to insecure defaults so the app boots
   offline.

2. **Hand-rolled HMAC-SHA256 session token, not `jsonwebtoken`.** A signed token
   `<base64url(payload)>.<base64url(HMAC-SHA256)>` carries
   `{ sub: 'admin', iat, exp }` (ms epoch) and is signed with `AUTH_SECRET`
   (`session-token.ts`). Verification is constant-time (`timingSafeEqual`) on the
   signature, then checks `exp`. This avoids adding a JWT dependency for a
   one-claim token while keeping the "signed cookie seeded by an env secret"
   shape.

3. **`AuthService` as a provider in `AppContext`.** A factory
   (`AuthService(cfg)`) exposing `verifyPassword` / `issueToken` / `verifyToken`
   is provider-injected like every other service, reading config from the env
   passed to the context builders and sourcing time from the context
   `timeService` (so tests are deterministic). The token TTL is a shared
   `SESSION_TTL_MS` (30 days) reused by the cookie expiry.

4. **Cookie + request wiring.** The token lives in a `sessionToken` cookie
   (`httpOnly`, `sameSite=lax`, `secure` on https, `path=/`, 30-day expiry).
   `hooks.server.ts` verifies it per request and sets `event.locals.admin`;
   `+layout.server.ts` surfaces it as `page.data.admin`. Any verify/parse failure
   yields `admin: false`.

5. **Gate the action, not the site.** Only admin-only UI and the `?/deleteJob`
   action are gated. The server action re-checks `locals.admin` (403 otherwise) —
   the hidden button is not the authority. Login redirects only to a validated
   local path (`safe-next.ts` blocks `//host`, `/\host`, and absolute URLs).
   `/logout` is POST-only so logout can't be forced cross-site via a GET.

## Consequences

- **Positive:** No new dependency; matches existing DI + hexagonal conventions;
  trivially testable (injected clock, pure token helpers, isolated `safeNext`);
  public site is untouched; the destructive delete is defended server-side.
- **Negative / limits:** A single shared secret means no per-user attribution,
  no revocation short of rotating `AUTH_SECRET` (which invalidates all sessions),
  and no audit trail beyond request logging. Hand-rolling the token means we own
  its correctness (covered by unit tests) rather than delegating to a vetted JWT
  library.
- **Precedent:** This establishes the auth boundary for the repo. If auth needs
  grow (multiple operators, roles, revocation, or SSO), that is a **new** decision
  that would supersede this ADR — likely reintroducing a real identity/JWT layer
  rather than extending the single-password scheme. Until then, new gated actions
  should follow the same pattern: check `locals.admin` server-side; keep the
  public surface public.
