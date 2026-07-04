# ADR: Split match capability — read-only share URL + secret edit token + soft-archive expiry

- **Status:** Accepted
- **Date:** 2026-07-04
- **Deciders:** Skybridge Skills
- **Supersedes:** None
- **Relates to / evolves:** [`2026-06-06-anonymous-match-capability-url-identity.md`](./2026-06-06-anonymous-match-capability-url-identity.md)

## Context

The [2026-06-06 ADR](./2026-06-06-anonymous-match-capability-url-identity.md) made
the match **id URL itself the capability**: `/jobs/[id]/match/[matchId]` where
`matchId = idService.secureUid()`, and **anyone holding the URL could read _and_
mutate** the match. That conflates two things a user actually wants to do
separately: **share** their match (read-only) and **edit/delete** it (owner-only).
Sharing the id URL today leaks edit access. That ADR also left two follow-ups open:
retention/expiry of anonymous matches, and ownership hardening.

There is still no auth/session model, and (per product direction) **no email** is
sent yet — the edit capability is displayed to the user on-screen after they save.

## Decision

Split the single id-URL capability into two, and add time-limited retention:

1. **Read-only share URL** — `/jobs/[id]/match/[matchId]` (no token) is now
   **read-only**. It renders the match for sharing (e.g. in a job application) and
   exposes no edit affordance and cannot mutate.
2. **Secret edit capability token** — a separate `capabilityToken =
idService.secureUid()` (128-bit, base-62) is minted at match creation and stored
   on the match. Edit + delete require presenting it as `?edit=<token>`; the server
   authorizes every mutation with a **constant-time** `verifyMatchCapability`. The
   whole create/assign/save flow runs on the `?edit=<token>` URL, and after save the
   edit URL is **displayed + copyable** (the only way back until accounts/passkeys
   land). Legacy matches (minted before this change) carry an empty token → they are
   read-only.
3. **Soft-archive expiry (`archiveAfter`)** — every match carries an `archiveAfter`
   date, defaulting to `createdAt + 30d`, user-settable to **30 / 60 / 90 days** and
   **extendable on edit**. After it passes, both URLs return **410** ("this match has
   expired") and the record is **hidden but retained**. Resolves the 2026-06-06
   retention follow-up.
4. **Delete** via the capability is a **hard delete** (removes the record and its
   verified-credential snapshot).

## Consequences

- **Behavior change:** the id URL, previously read+write, is now **read-only**;
  editing requires the secret token. Acceptable at this staging/POC stage (the id URL
  was the only "owner" mechanism, and the create flow now carries the token).
- The **edit token is a bearer secret** shown on-screen (not emailed). Anyone with
  the `?edit=<token>` URL can edit/delete. Still not an identity guarantee — the
  ownership-hardening follow-up (cookie-scoped matches, passkeys/accounts, wallet-badge
  re-entry) supersedes this when it lands.
- Anonymous matches (and their credential snapshots) now **auto-expire** by policy
  (soft archive), bounding retention of unverified/abandoned data. No DynamoDB TTL
  auto-delete yet — expired records are retained/hidden; a far-future TTL for eventual
  hard cleanup is a possible future add.
- `capabilityToken` must stay high-entropy (`secureUid`) and is never rendered in the
  read-only payload/markup.

## Alternatives considered

- **Keep the id URL as read+write (status quo).** Rejected: cannot share a match
  without granting edit access — the core need here.
- **DynamoDB native TTL for expiry.** Rejected for now: turns "archive" into an
  eventual (~48h) hard delete and 404s; we want a friendly, retained "expired" state.
- **Email the capability URL.** Deferred: no email infrastructure exists; the URL is
  displayed on-screen for now (passkey/wallet-badge re-entry is the future path).
- **Nested `/edit/[token]` route vs `?edit=<token>` query param.** Chose the query
  param on the single match page (one-page read-only-vs-edit) for the smallest route
  surface; the token is equally secret either way.

## Follow-ups

- Ownership hardening (cookie-scoped "my matches", passkeys/accounts, wallet-badge
  re-entry) — will supersede the bearer-token ownership model.
- Optional DynamoDB TTL to hard-delete long-archived matches.
