import { parseEmbedMode, type EmbedMode } from './embed-mode.js';

export interface EmbedLaunchParams {
	embed: EmbedMode;
	/** Recovered `lc_host_override`, but only when it is a valid https origin; else null. */
	hostOrigin: string | null;
}

/** Accept any https origin (return its normalized origin); reject everything else. */
function parseHttpsOrigin(value: string | null): string | null {
	if (!value) return null;
	try {
		const u = new URL(value);
		return u.protocol === 'https:' ? u.origin : null;
	} catch {
		return null;
	}
}

/**
 * Read embed launch params, repairing LearnCard's malformed double-`?` launch URL. LearnCard appends
 * `?lc_host_override=…` with `?` (not `&`) to a launch URL that already has a query, producing
 * `?embed=X?lc_host_override=Y`. We turn every stray `?` (after the leading one) into `&` before
 * parsing, so both params are recovered. Well-formed URLs are unaffected.
 *
 * Limitation: a param value that legitimately contains a literal `?` would be split. The two params
 * we read here (`embed`, `lc_host_override`) never do, so this repair is safe for the launch params.
 */
export function readEmbedLaunchParams(url: URL): EmbedLaunchParams {
	const repaired = new URLSearchParams(url.search.replace(/^\?/, '').replace(/\?/g, '&'));
	return {
		embed: parseEmbedMode(repaired.get('embed')),
		hostOrigin: parseHttpsOrigin(repaired.get('lc_host_override'))
	};
}
