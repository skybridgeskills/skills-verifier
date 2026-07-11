import { readEmbedLaunchParams } from './embed-launch-params.js';
import { parseEmbedMode, type EmbedMode } from './embed-mode.js';

/**
 * Session-scoped memory of the verify-page embed variant. When a page is launched with
 * `?embed=learncard-partner-connect`, that intent should survive in-session navigation even if the
 * user later lands on a match URL without the query param (e.g. via an internal link). We persist it
 * in `sessionStorage` (cleared when the tab/session ends), not `localStorage`.
 */
const STORAGE_KEY = 'sv:embed-mode';

/**
 * Session-scoped memory of the recovered LearnCard host origin (`lc_host_override`). Mirrors the
 * embed-mode persistence: the override arrives on the launch URL but the match page URL has no
 * query, so it must survive in-session navigation to reach the partner-connect request.
 */
const HOST_ORIGIN_KEY = 'sv:embed-host-origin';

/** Remember the embed mode for the rest of this browser session. No-op on the server or for `null`. */
export function rememberEmbedMode(mode: EmbedMode): void {
	if (typeof sessionStorage === 'undefined' || !mode) return;
	try {
		sessionStorage.setItem(STORAGE_KEY, mode);
	} catch {
		// sessionStorage can throw (private mode / disabled); the URL param still works this load.
	}
}

/** Read the remembered embed mode for this session (or `null` on the server / when unset). */
export function readEmbedMode(): EmbedMode {
	if (typeof sessionStorage === 'undefined') return null;
	try {
		return parseEmbedMode(sessionStorage.getItem(STORAGE_KEY));
	} catch {
		return null;
	}
}

/**
 * Remember the LearnCard host origin for the rest of this browser session. No-op on the server or
 * for `null` — so a param-less navigation never clears an already-remembered origin.
 */
export function rememberEmbedHostOrigin(origin: string | null): void {
	if (typeof sessionStorage === 'undefined' || !origin) return;
	try {
		sessionStorage.setItem(HOST_ORIGIN_KEY, origin);
	} catch {
		// sessionStorage can throw (private mode / disabled); the URL param still works this load.
	}
}

/** Read the remembered LearnCard host origin for this session (or `null` on the server / unset). */
export function readEmbedHostOrigin(): string | null {
	if (typeof sessionStorage === 'undefined') return null;
	try {
		return sessionStorage.getItem(HOST_ORIGIN_KEY);
	} catch {
		return null;
	}
}

/**
 * Capture the embed variant (and recovered host origin) from a page URL into the session
 * (client-only). Repairs LearnCard's malformed double-`?` launch URL, narrows `?embed=`, and
 * remembers it along with a valid https `lc_host_override`. No-op on the server, for unknown values,
 * or for `null` — so a param-less navigation never clears an already-remembered mode/origin. This
 * lets an embed session start on any route (e.g. `/jobs?embed=learncard-partner-connect`), not just
 * the match page.
 */
export function captureEmbedFromUrl(url: URL): void {
	const { embed, hostOrigin } = readEmbedLaunchParams(url);
	rememberEmbedMode(embed);
	rememberEmbedHostOrigin(hostOrigin);
}
