# ADR: DCC verify-exchange provider (VC-API, poll-only, Http + Fake)

- **Status:** Accepted
- **Date:** 2026-06-06
- **Deciders:** Skybridge Skills
- **Supersedes:** None
- **Superseded by:** `2026-07-06-verify-exchange-bearer-auth.md` (auth-scheme detail only)

## Context

The skills-match flow needs to obtain a viewer's verified Open Badges
(`OpenBadgeCredential`s) from their wallet. The DCC `dcc-transaction-service` exposes a
VC-API verify workflow for this. skills-verifier had no credential-verification
integration; we needed a contract that fits the app's provider-DI conventions and is
testable offline (no real DCC service or wallet in CI).

## Decision

Introduce a `verificationExchange` service in the app context with a small port and
two adapters, following the existing `Http`/`Fake` provider pattern:

- **Contract** (`src/lib/server/domain/verification/verification-exchange.ts`):
  - `createVerifyExchange() → { exchangeId, protocols: { iu, vcapi, lcw, verifiablePresentationRequest } }`
  - `getExchangeStatus({ exchangeId, vcapi }) → { state, verifiedCredentials[] }`
- **Open Badges QueryByExample** verify variables: OB v3 context +
  `vprCredentialType: ['OpenBadgeCredential']`, `vprClaims: []` (accept all).
- **`HttpVerificationExchange`** targets `POST {base}/workflows/verify/exchanges` then
  `GET {vcapi}`. Base URI is `TRANSACTION_SERVICE_BASEURI`; tenant
  `TRANSACTION_SERVICE_TENANT` (default `default`); optional Basic auth from
  `TRANSACTION_SERVICE_TOKEN` (header sent only when set; never logged); public
  `EXCHANGE_HOST` for the interact URL; optional `TRANSACTION_SERVICE_TRUSTED_REGISTRIES`.
- **`FakeVerificationExchange`** returns a canned interact URL and auto-completes after
  a fixed poll count with fixture credentials — drives unit and e2e tests offline.
- **Completion is poll-only.** There is no webhook/websocket; the browser polls a
  **server-proxied** route (`/jobs/[id]/match/[matchId]/status`) that holds the token
  and reads `exchangeId`/`vcapi` from the persisted match (not client-supplied). Only
  `state === 'complete'` is trusted (an exchange may sit at `active` during async
  verification); on completion the verified credentials are snapshotted onto the match.
- **QR + interact URL**: the server generates a QR data-URL (`qrcode`) from
  `protocols.iu`; the same-device path is an `<a target="_blank" href={iu}>`.

Selection per context: `aws` → Http; `test` → Fake; `dev` → Http when
`TRANSACTION_SERVICE_BASEURI` is set, else Fake (mirrors the Credential Engine pattern).

## Consequences

- A clean seam to the DCC verify workflow that is fully testable without network or a
  wallet; the e2e exercises the whole flow via the Fake.
- Coupling to the DCC VC-API verify shape (`variables.results.default.matchedCredentials`,
  flat-or-nested `protocols`); parsing is isolated in `parse-exchange-response.ts`.
- Poll-only means latency/throughput depend on the poll interval (~2.5s) and the
  service's async-verification timing; the server proxy adds trust + token safety.
- New env-var contract for staging/prod (`TRANSACTION_SERVICE_BASEURI` etc.).

## Alternatives Considered

- **OID4VP** — not implemented by `dcc-transaction-service` today; VC-API +
  QueryByExample is the supported path.
- **Client-direct polling of `vcapi`** — rejected: would expose the service token to the
  browser and trust client-supplied exchange identifiers. Server-proxied polling instead.
- **Webhook/callback completion** — not offered by the service; poll-only is the
  available mechanism.

## Follow-ups

- Re-evaluate OID4VP if/when upstream supports it.
- Trust/issuer policy UI (choosing trusted registries/issuers per job).
- Production tuning of poll interval/backoff and exchange TTLs.
