/**
 * Pure helpers for the match capability token + soft-archive expiry.
 *
 * The match id URL is public/shareable and read-only; a separate secret
 * `capabilityToken` (minted at creation, carried as `?edit=<token>`) authorizes
 * edit + delete. See ADR `docs/adr/2026-07-04-match-capability-token-and-expiry.md`.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_EXPIRY_DAYS = 30;
export const MAX_EXPIRY_DAYS = 90;

/** `now + 30 days` — the default soft-archive date a new match is minted with. */
export function defaultArchiveAfter(now: Date): Date {
	return new Date(now.getTime() + DEFAULT_EXPIRY_DAYS * DAY_MS);
}

/** `now + clamp(days, 1..90)` — used when the user extends expiry on edit. */
export function extendedArchiveAfter(now: Date, days: number): Date {
	const clamped = Math.min(Math.max(Math.trunc(days), 1), MAX_EXPIRY_DAYS);
	return new Date(now.getTime() + clamped * DAY_MS);
}

/** True once the soft-archive date has passed (share/edit URLs then 410). */
export function isMatchExpired(match: { archiveAfter: Date }, now: Date): boolean {
	return now.getTime() >= match.archiveAfter.getTime();
}

/**
 * Constant-time capability check: `true` iff `token` matches the match's
 * `capabilityToken`. An empty stored token (legacy matches) or an empty/absent
 * presented token never passes, so those matches stay read-only. Compares in
 * constant time over equal-length strings to avoid a timing side channel.
 */
export function verifyMatchCapability(
	match: { capabilityToken: string },
	token: string | null | undefined
): boolean {
	const expected = match.capabilityToken;
	if (!expected || !token || token.length !== expected.length) return false;
	let diff = 0;
	for (let i = 0; i < expected.length; i++) {
		diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
	}
	return diff === 0;
}
