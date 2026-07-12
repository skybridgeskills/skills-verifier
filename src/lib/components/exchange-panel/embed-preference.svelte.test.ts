import { beforeEach, describe, expect, it } from 'vitest';

import { EMBED_LEARNCARD_PARTNER_CONNECT } from './embed-mode.js';
import { captureEmbedFromUrl, readEmbedHostOrigin, readEmbedMode } from './embed-preference.js';

// Runs in the browser (client) vitest project — named `.svelte.test.ts` so it gets a real
// `sessionStorage`, which the node/server project does not provide.
const STORAGE_KEY = 'sv:embed-mode';
const HOST_ORIGIN_KEY = 'sv:embed-host-origin';

function urlWithEmbed(value?: string): URL {
	const url = new URL('https://verify.example.com/jobs');
	if (value !== undefined) url.searchParams.set('embed', value);
	return url;
}

/** LearnCard's real, malformed launch URL (second `?` instead of `&`). */
function mangledLaunchUrl(hostOverride = 'https://learncard.app'): URL {
	return new URL(
		`https://verify.example.com/jobs?embed=${EMBED_LEARNCARD_PARTNER_CONNECT}?lc_host_override=${hostOverride}`
	);
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

	it('recovers embed mode + host origin from the malformed double-`?` launch URL', () => {
		captureEmbedFromUrl(mangledLaunchUrl('https://learncard.app'));

		expect(readEmbedMode()).toBe(EMBED_LEARNCARD_PARTNER_CONNECT);
		expect(sessionStorage.getItem(HOST_ORIGIN_KEY)).toBe('https://learncard.app');
		expect(readEmbedHostOrigin()).toBe('https://learncard.app');
	});

	it('remembers a white-label https host override', () => {
		captureEmbedFromUrl(mangledLaunchUrl('https://scoutpass.example.com'));

		expect(readEmbedHostOrigin()).toBe('https://scoutpass.example.com');
	});

	it('does not remember a non-https host override', () => {
		captureEmbedFromUrl(mangledLaunchUrl('http://learncard.app'));

		expect(readEmbedMode()).toBe(EMBED_LEARNCARD_PARTNER_CONNECT);
		expect(readEmbedHostOrigin()).toBeNull();
	});

	it('does not clear an already-remembered host origin on a param-less navigation (sticky)', () => {
		captureEmbedFromUrl(mangledLaunchUrl('https://scoutpass.example.com'));
		expect(readEmbedHostOrigin()).toBe('https://scoutpass.example.com');

		captureEmbedFromUrl(urlWithEmbed());

		expect(readEmbedHostOrigin()).toBe('https://scoutpass.example.com');
	});
});
