import { parseEmbedMode, type EmbedMode } from './embed-mode.js';

/**
 * Session-scoped memory of the verify-page embed variant. When a page is launched with
 * `?embed=learncard-partner-connect`, that intent should survive in-session navigation even if the
 * user later lands on a match URL without the query param (e.g. via an internal link). We persist it
 * in `sessionStorage` (cleared when the tab/session ends), not `localStorage`.
 */
const STORAGE_KEY = 'sv:embed-mode';

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
 * Capture the embed variant from a page URL into the session (client-only). Reads `?embed=`,
 * narrows it, and remembers it. No-op on the server, for unknown values, or for `null` — so a
 * param-less navigation never clears an already-remembered mode. This lets an embed session start
 * on any route (e.g. `/jobs?embed=learncard-partner-connect`), not just the match page.
 */
export function captureEmbedFromUrl(url: URL): void {
	rememberEmbedMode(parseEmbedMode(url.searchParams.get('embed')));
}
