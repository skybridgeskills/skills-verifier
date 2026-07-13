# ADR: Forgiving invalid verification results (assign credentials regardless of outcome)

- **Status:** Accepted
- **Date:** 2026-07-12
- **Deciders:** Skybridge Skills
- **Supersedes:** None
- **Superseded by:** None

## Context

A DCC `dcc-transaction-service` verify exchange resolves to one of `pending`,
`active`, `complete`, or `invalid`. `determineExchangeOutcome` returns `invalid`
when the presentation is not verified **or** any credential is not verified;
otherwise `complete`. In both terminal states verifier-core produces a full
result at `variables.results.default` (presentation-level `presentationResults[]`
and per-credential `credentialResults[]`, each check carrying
`{ outcome: { status, problems[] }, fatal }`).

Previously `skills-verifier` extracted credentials **only** on `complete`. An
`invalid` exchange persisted no credentials and the applicant hit a dead-end
destructive alert, even when the returned credentials were perfectly usable for
building a match (e.g. a single non-fatal "issuer not in a trusted registry"
warning flipped the whole exchange to `invalid`).

Product intent is the opposite: let applicants **use the returned credentials
regardless of verification outcome**, with honest framing of what failed. The
applicant — not the verifier — decides whether an imperfect credential is worth
presenting to an employer.

## Decision

1. **Pass the result through whenever it exists** (complete **or** invalid).
   `toExchangeStatus` extracts credentials + presentation problems for both
   terminal states; the `status` and `present` routes persist and return them
   for both.

2. **Distill, don't hoard.** Rather than persist the raw verifier-core result,
   we store a compact projection: per-credential `verified: boolean` +
   `problems: VerificationProblem[]`, and match-level
   `presentationProblems: VerificationProblem[]`, where
   `VerificationProblem = { check?, title, detail?, fatal }`. Extraction prefers
   `credentialResults[]` (which carries status), falling back to the
   `matchedCredentials` VC list (treated as verified, no problems). All new
   fields default (`verified: true`, `problems: []`, `presentationProblems: []`)
   so legacy DynamoDB rows still parse.

3. **Critical = `fatal === true`** (a failed, fatal check). The overall outcome
   is a pure function of all problems (presentation + per-credential):
   `invalid` if any problem is fatal, else `warning` if any problem exists, else
   `valid`. This is deliberately independent of the exchange's complete/invalid
   state, so non-fatal warnings on a `complete` exchange still surface as a
   warning.

4. **Allow assignment regardless of outcome.** Credentials that failed
   verification — including cryptographically invalid ones — can be dragged and
   assigned to skills exactly like clean ones. The board shows one overall banner
   (quiet valid / amber warning / red invalid) and each card exposes an
   expandable list of its problems with a `Critical` marker on fatal ones. The
   read-only employer share view shows a lightweight per-credential status
   indicator (Verified / Warning / Not fully verified).

5. **Preserve the hard-failure path.** When no usable result is available (no
   `results.default`, an expired exchange, or a transport/VP rejection in the
   `present` relay), the existing invalid/error state is kept. Only a present
   result flips the applicant onto the forgiving board.

## Consequences

- Applicants can build matches from imperfect credentials instead of
  dead-ending; a lone non-fatal warning no longer blocks the whole flow.
- **Trust/security note:** cryptographically invalid credentials (e.g. a bad
  signature) can be assigned. This is intentional and always explicitly
  surfaced — never silently trusted. The verifier-core verdict is preserved
  (`verified` + distilled `problems`) and shown in both the editable board and
  the read-only employer view, so the failure travels with the credential.
- Distilled storage keeps the DynamoDB footprint bounded; the full raw result is
  **not** persisted. Consumers that later need the raw verifier-core output would
  have to re-verify — recorded as a limitation / future work.
- The forgiving path is gated on a result actually being present, so genuine
  transport failures and hard VP rejections still surface as errors.

## Alternatives Considered

- **Keep hard-failing on invalid.** Rejected: it blocks usable credentials over
  non-fatal warnings and contradicts the product intent.
- **Persist the full raw verifier-core result.** Rejected: large and unbounded
  in DynamoDB, and the UI only needs distilled problems. Distillation matches the
  existing `VerifiedCredential` snapshot pattern.
- **Block assignment of fatally-invalid credentials.** Rejected: the applicant,
  not the verifier, should decide what to present; the fatal status is surfaced
  clearly rather than enforced.
