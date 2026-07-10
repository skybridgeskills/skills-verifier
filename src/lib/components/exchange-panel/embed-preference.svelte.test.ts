import { beforeEach, describe, expect, it } from 'vitest';

import { EMBED_LEARNCARD_PARTNER_CONNECT } from './embed-mode.js';
import { captureEmbedFromUrl, readEmbedMode } from './embed-preference.js';

// Runs in the browser (client) vitest project — named `.svelte.test.ts` so it gets a real
// `sessionStorage`, which the node/server project does not provide.
const STORAGE_KEY = 'sv:embed-mode';

function urlWithEmbed(value?: string): URL {
	const url = new URL('https://verify.example.com/jobs');
	if (value !== undefined) url.searchParams.set('embed', value);
	return url;
}

describe('captureEmbedFromUrl', () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	it('remembers the embed variant from any route URL (e.g. /jobs?embed=...)', () => {
		captureEmbedFromUrl(urlWithEmbed(EMBED_LEARNCARD_PARTNER_CONNECT));

		expect(sessionStorage.getItem(STORAGE_KEY)).toBe(EMBED_LEARNCARD_PARTNER_CONNECT);
		expect(readEmbedMode()).toBe(EMBED_LEARNCARD_PARTNER_CONNECT);
	});

	it('ignores unknown embed values (no write)', () => {
		captureEmbedFromUrl(urlWithEmbed('something-else'));

		expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
		expect(readEmbedMode()).toBeNull();
	});

	it('does not clear an already-remembered mode when the param is absent (sticky session)', () => {
		captureEmbedFromUrl(urlWithEmbed(EMBED_LEARNCARD_PARTNER_CONNECT));
		expect(readEmbedMode()).toBe(EMBED_LEARNCARD_PARTNER_CONNECT);

		captureEmbedFromUrl(urlWithEmbed());

		expect(readEmbedMode()).toBe(EMBED_LEARNCARD_PARTNER_CONNECT);
	});
});
