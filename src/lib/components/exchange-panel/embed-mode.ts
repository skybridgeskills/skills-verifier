/**
 * Verify-page embed variants (presentation-only). Selected via the `?embed=<value>` query param.
 *
 * `learncard-partner-connect` renders the LearnCard partner-connect request flow (a "Request from
 * LearnCard" button that asks the host wallet for credentials) instead of the interaction-URL QR,
 * for when the page is embedded inside the LearnCard app.
 */
export const EMBED_LEARNCARD_PARTNER_CONNECT = 'learncard-partner-connect';

export type EmbedMode = typeof EMBED_LEARNCARD_PARTNER_CONNECT | null;

/** Narrow a raw `?embed=` query value to a known `EmbedMode` (or `null` when unset/unknown). */
export function parseEmbedMode(value: string | null | undefined): EmbedMode {
	return value === EMBED_LEARNCARD_PARTNER_CONNECT ? EMBED_LEARNCARD_PARTNER_CONNECT : null;
}
