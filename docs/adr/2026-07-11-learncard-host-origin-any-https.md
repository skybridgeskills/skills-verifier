# ADR: Accept any https `lc_host_override` as the partner-connect host origin (no allowlist)

- **Status:** Accepted
- **Date:** 2026-07-11
- **Deciders:** Skybridge Skills
- **Supersedes:** None
- **Superseded by:** None
- **Related:** [2026-07-07 — Browser-obtained presentations are relayed through DCC](2026-07-07-learncard-embed-presentation-relay.md)

## Context

The `?embed=learncard-partner-connect` variant requests credentials from the LearnCard host wallet
over cross-origin `postMessage` via the `@learncard/partner-connect` SDK. The SDK targets a
`hostOrigin`, and LearnCard tells the embedded app which origin to use by appending an
`lc_host_override` query param to the launch URL.

Two facts constrain the design:

1. **LearnCard always sends a malformed launch URL.** Our registered App Store Launch URL already
   has a query (`/jobs?embed=learncard-partner-connect`), and LearnCard appends its hint with a stray
   second `?` instead of `&`, producing
   `/jobs?embed=learncard-partner-connect?lc_host_override=https://learncard.app`. `URLSearchParams`
   reads that as a single `embed` value, so neither the embed variant nor the SDK's own
   `lc_host_override` read works. We repair the URL at our parse boundary
   (`readEmbedLaunchParams`, stray `?`→`&`) and recover both params ourselves. Because the malformed
   URL is the steady-state input, the SDK never parses the override on its own; the recovered value
   must be passed to the SDK as its single-string `hostOrigin`.
2. **LearnCard uses white-label domains** (e.g. `scoutpass`, `vetpass`) and onboards them without
   notifying us. We cannot maintain a fixed allowlist of trusted host origins without tracking every
   white-label client.

The question: which host origins do we accept as the partner-connect handshake target?

## Decision

Accept **any** origin whose recovered `lc_host_override` is a valid `https:` URL, normalized to its
origin, and use it as the partner-connect `hostOrigin`. Reject non-https and absent overrides, which
fall back to the env default (`PUBLIC_LEARNCARD_HOST_ORIGIN`, default `https://learncard.app`). No
fixed allowlist.

The recovered override is remembered in `sessionStorage` (mirroring the embed-mode persistence,
key `sv:embed-host-origin`) so it survives in-session navigation to a match URL that carries no
query, and the SSR `load` for the match route applies the same recovery so a direct/mangled landing
behaves like the client path.

## Consequences

- Any LearnCard white-label host (present or future) works without a code or config change, as long
  as it is served over https. This matches how LearnCard actually onboards clients.
- **Residual risk (accepted).** A user who opens our page inside a hostile frame that sets
  `lc_host_override=https://evil.com` could be induced to share a Verifiable Presentation to that
  frame via the SDK. The only guard is requiring `https:`. This is an accepted tradeoff.
- **The verification trust model is unaffected.** Trust for credential _verification_ stays
  server-side: the VP is relayed to DCC and re-verified under the match capability token (per the
  2026-07-07 ADR). A malicious embedder cannot inject verified credentials; the exposure is limited
  to a user being induced to _share_ a VP with a hostile origin, not to forged verification.
- `https:`-only is enforced at a single boundary (`parseHttpsOrigin` in `embed-launch-params.ts`);
  tightening the policy later (e.g. adding an allowlist or a suffix check) is a localized change.

## Alternatives Considered

- **Fixed host-origin allowlist.** Rejected: LearnCard onboards white-label domains without notice,
  so an allowlist would require tracking every client and would silently break new ones.
- **Fix the root cause with a query-less Launch URL** (so LearnCard's `?`-append is well-formed and
  the SDK parses `lc_host_override` itself). Deferred: it needs a path-based embed signal and App
  Store re-registration. We own the parser-hardening fix; it ships now without re-registration. A
  clean Launch URL remains a possible future improvement.
- **Prod-only (`https://learncard.app`), ignore the override entirely.** Rejected: it cannot support
  LearnCard's white-label / staging origins, which is the reason the override exists.
