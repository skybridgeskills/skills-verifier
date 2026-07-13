# ADR: Verification exchanges accumulate credentials onto a match (additive merge)

- **Status:** Accepted
- **Date:** 2026-07-12
- **Deciders:** Skybridge Skills
- **Supersedes:** None
- **Superseded by:** None

## Context

A match imports verified credentials by running a DCC verify exchange: the
applicant shares credentials from a wallet, the transaction service verifies
them, and skills-verifier persists the result on the match
(`verifiedCredentials[]`) before the applicant assigns them to job skills.

Originally a completed exchange **replaced** the match's whole credential list —
`saveMatchCredentialsQuery` set
`verifiedCredentials: params.verifiedCredentials ?? existing.verifiedCredentials`,
and both the status-poll and the `present` relay passed the new exchange's
credentials straight through. That is fine for a single import, but it makes a
**second** exchange destructive: it wipes the badges from the first.

Applicants legitimately need more than one exchange:

- Two wallets holding different badges.
- A wallet that can only submit one badge at a time.

They must be able to start a new exchange after a prior one has concluded and
have the new badges join the existing set, without losing already-imported
badges or the assignments made against them.

## Decision

Completed exchanges **accumulate** credentials onto the match instead of
replacing them.

1. A pure helper `mergeCredentialsById(existing, incoming)` performs an additive
   merge: existing order is preserved; an incoming credential whose
   `credentialId` matches an existing entry **replaces it in place** (last write
   wins, so a re-submitted credential refreshes its verification status and
   problems); genuinely new incoming ids are appended in incoming order.
2. `saveMatchCredentialsQuery` (both the memory and DynamoDB implementations)
   merges when `verifiedCredentials` is supplied, and preserves the existing list
   untouched when it is not. Because `merge([], incoming) === incoming`, the
   **first** exchange behaves exactly as before and the completion routes
   (`status`, `present`) need no change — merge is unconditional, with no flag
   threaded through the params or endpoints.
3. `presentationProblems` (VP-level, per exchange) is **replaced** with the
   latest exchange's value when supplied. Per-credential problems ride along
   inside the merged credentials and are therefore retained.

Only one exchange is active at a time: `startExchange` overwrites
`exchangeId`/`vcapi` and omits `verifiedCredentials`, so merely starting a new
exchange preserves existing credentials. Exchanges are sequential ("after an
exchange has concluded").

## Consequences

- A second (third, …) exchange adds badges rather than wiping prior ones;
  existing assignments to surviving `credentialId`s are preserved.
- Re-submitting the same credential refreshes its record (status/problems)
  without creating a duplicate — `credentialId` is the dedupe key.
- Badges accumulate on the match until it is deleted or expires; there is no
  server-side "clear credentials" affordance (deleting the match is the reset).
- The VP-level banner reflects only the **most recent** exchange; earlier
  presentation-level warnings are not retained (per-credential problems are).
- Because merge is unconditional in the query, all call sites get accumulation
  for free and the first-exchange path is provably unchanged (`merge([], x) === x`).
- Only sequential exchanges are supported; concurrent/parallel active exchanges
  are out of scope (single `exchangeId`/`vcapi`).

## Alternatives Considered

- **Keep replacing (status quo).** Rejected: makes a second exchange destructive,
  which is exactly the use case we need to support.
- **Dedupe keeping the first record on `credentialId` collision.** Rejected: a
  re-submission would then keep a stale verification status; last-write-wins keeps
  the freshest verifier result.
- **Append allowing duplicates (no dedupe).** Rejected: the same badge submitted
  twice would appear twice and create duplicate assignment targets.
- **Accumulate `presentationProblems` across exchanges.** Rejected: stale VP-level
  warnings from an earlier wallet would linger and muddle the banner; per-credential
  problems already carry the durable, credential-specific signal.
- **Thread a `mergeCredentials` flag through the params/routes.** Rejected as
  unnecessary: `merge([], incoming) === incoming` makes unconditional merge safe
  for the first exchange, so a flag would add surface area with no behavioral gain.
