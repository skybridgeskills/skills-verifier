import { describe, expect, it } from 'vitest';

import { EMBED_LEARNCARD_PARTNER_CONNECT, parseEmbedMode } from './embed-mode.js';

describe('parseEmbedMode', () => {
	it('recognizes the learncard-partner-connect variant', () => {
		expect(parseEmbedMode('learncard-partner-connect')).toBe(EMBED_LEARNCARD_PARTNER_CONNECT);
	});

	it('returns null for unknown / absent values', () => {
		expect(parseEmbedMode(null)).toBeNull();
		expect(parseEmbedMode(undefined)).toBeNull();
		expect(parseEmbedMode('')).toBeNull();
		expect(parseEmbedMode('something-else')).toBeNull();
	});
});
