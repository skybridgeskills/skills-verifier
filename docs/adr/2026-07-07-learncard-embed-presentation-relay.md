# ADR: Browser-obtained presentations are relayed through DCC, not trusted client-side

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Skybridge Skills
- **Supersedes:** None
- **Superseded by:** None

## Context

The match page verifies credentials through a DCC verify exchange. In the default flow a wallet
scans the QR (or opens the interaction URL) and posts a Verifiable Presentation (VP) directly to the
exchange's VC-API participate endpoint (`vcapi`); the transaction service verifies the VP
cryptographically and skills-verifier only ever polls for `complete` and reads back the verified
credentials. The browser never handles the VP, so it never has to be trusted.

To embed the page inside the LearnCard app store we added a `?embed=learncard-partner-connect`
variant that requests credentials via the `@learncard/partner-connect` SDK. Unlike the QR flow, that
SDK returns the VP **to our browser code** (over cross-origin `postMessage`). We needed a way to turn
that browser-held VP into verified credentials without weakening the existing trust model, and
without the presentation being rejected for signing against the wrong challenge/domain.

## Decision

The browser never verifies or persists the VP. Instead:

1. A new capability-authorized endpoint, `POST /jobs/[id]/match/[matchId]/present`, accepts
   `{ editToken, verifiablePresentation }`. It authorizes with the match capability token
   server-side (same check as edit/delete), reads the exchange's `vcapi` from the persisted match
   (never from the client), and relays the VP to the transaction service via
   `VerificationExchange.submitPresentation`. The transaction service performs the same server-side
   verification as the QR flow; on `complete` the endpoint persists the verified credentials with the
   existing query.
2. The VP is signed against the exchange's own `challenge`/`domain`. Those are read from the
   exchange's VerifiablePresentationRequest at `startExchange` time (with a participate-endpoint
   fetch as fallback) and surfaced to the client, rather than being generated in the browser. This
   guarantees the presentation matches what the verifier expects.
3. The relay surfaces (`submitPresentation`, `fetchExchangeVpr`, the `present` endpoint) are
   persona-neutral. Only the presentation/client/config/copy layer knows about "LearnCard".

## Consequences

- The embed variant reuses the exact server-side verification and persistence as the QR flow; a
  compromised or malicious browser cannot inject unverified credentials, because DCC is still the
  verifier and authorization is a server-checked capability token.
- The client obtaining the VP is purely a transport convenience; trust stays on the server.
- `submitPresentation` failures are mapped so that a 4xx from the transaction service (the VP itself
  was rejected — bad proof/challenge) becomes `422`, while transport/upstream errors become `502`.
- The default QR flow is unchanged.
- **Deployment note (out of scope here):** actually rendering inside LearnCard's iframe/webview
  requires relaxing `frame-ancestors` (CSP / `X-Frame-Options`) at the hosting layer. This app does
  not set those headers; infra must configure them to enable the embed in production.

## Alternatives Considered

- **Trust the VP in the browser / verify client-side.** Rejected: it moves the trust boundary into
  an embedded, cross-origin browser context and duplicates verification logic the transaction service
  already owns.
- **Generate `challenge`/`domain` in the browser.** Rejected: the transaction service binds the
  exchange to its own challenge/domain, so a self-generated value would be rejected. We surface the
  server-authoritative values instead.
- **A dedicated LearnCard verification path (separate from DCC).** Rejected: it would fork the trust
  model and the credential-persistence path for one embed host; relaying through the existing
  exchange keeps a single verification pipeline.
