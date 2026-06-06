# ADR: Anonymous skills-match identity via capability URL

- **Status:** Accepted
- **Date:** 2026-06-06
- **Deciders:** Skybridge Skills
- **Supersedes:** None
- **Superseded by:** None

## Context

The skills-match + verification flow lets an anonymous viewer of a job create a
"match", run a credential verification exchange, and assign verified credentials to
the job's skills. skills-verifier has **no authentication or session model today** —
all routes are public and `Locals` carries only `requestId`. We needed a way to own
and re-load a match (which holds verified credentials and assignment narratives)
without blocking the flow on building auth.

## Decision

A match is identified and "owned" by an **unguessable capability URL**:
`/jobs/[id]/match/[matchId]`, where `matchId = idService.secureUid()`. Anyone holding
the URL can read and mutate that match; there is no login, cookie scoping, or
account. The match `load` validates only that the match exists and belongs to the job
in the path.

Explicit fast-follow seams are marked in code with
`// IDENTITY (fast-follow): ownership/session would attach here` at both the
`createMatch` action (`src/routes/jobs/[id]/+page.server.ts`) and the match `load`
(`src/routes/jobs/[id]/match/[matchId]/+page.server.ts`), so a later ownership-hardening
plan has clear attachment points.

## Consequences

- Unblocks the verification flow with zero auth infrastructure.
- The capability URL is a bearer secret: anyone with the link can view/modify the
  match, including the verified-credential snapshot. Acceptable for the current
  staging/POC stage and the non-sensitive demo data; **not** an identity guarantee.
- A fast-follow plan must harden ownership (cookie-scoped "my matches", optional
  accounts, employer-visible submissions). Documented in `docs/design/open-questions.md`.
- `matchId` must stay high-entropy (`secureUid`), never sequential/guessable.

## Alternatives Considered

- **Require login/session before creating a match** — rejected for now: no auth exists;
  would be a large prerequisite and hurts the anonymous "try it" flow.
- **Cookie-scoped anonymous ownership** — deferred to the fast-follow; the capability
  URL is the minimal first step and the cookie scoping layers on top of it cleanly.

## Follow-ups

- Identity/ownership hardening plan (cookie-scoped matches, optional accounts).
- Decide retention/expiry of anonymous matches and their credential snapshots.
