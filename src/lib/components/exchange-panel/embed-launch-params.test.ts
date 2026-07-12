import { describe, expect, it } from 'vitest';

import { readEmbedLaunchParams } from './embed-launch-params.js';
import { EMBED_LEARNCARD_PARTNER_CONNECT } from './embed-mode.js';

describe('readEmbedLaunchParams', () => {
	it('repairs LearnCard’s malformed double-`?` launch URL (recovers embed + host origin)', () => {
		const url = new URL(
			'https://verify.example.com/jobs?embed=learncard-partner-connect?lc_host_override=https://learncard.app'
		);

		expect(readEmbedLaunchParams(url)).toEqual({
			embed: EMBED_LEARNCARD_PARTNER_CONNECT,
			hostOrigin: 'https://learncard.app'
		});
	});

	it('reads a well-formed URL (`&`-joined params) unchanged', () => {
		const url = new URL(
			'https://verify.example.com/jobs?embed=learncard-partner-connect&lc_host_override=https://staging.learncard.app'
		);

		expect(readEmbedLaunchParams(url)).toEqual({
			embed: EMBED_LEARNCARD_PARTNER_CONNECT,
			hostOrigin: 'https://staging.learncard.app'
		});
	});

	it('accepts any https origin (white-label host) and normalizes to its origin', () => {
		const url = new URL(
			'https://verify.example.com/jobs?embed=learncard-partner-connect?lc_host_override=https://scoutpass.example.com/path?x=1'
		);

		// The trailing `?x=1` is also `&`-normalized but is not a param we read; the override URL
		// still parses and collapses to its origin.
		expect(readEmbedLaunchParams(url).hostOrigin).toBe('https://scoutpass.example.com');
	});

	it('returns hostOrigin null when the override is missing', () => {
		const url = new URL('https://verify.example.com/jobs?embed=learncard-partner-connect');

		expect(readEmbedLaunchParams(url)).toEqual({
			embed: EMBED_LEARNCARD_PARTNER_CONNECT,
			hostOrigin: null
		});
	});

	it('rejects a non-https override (falls back to null)', () => {
		const url = new URL(
			'https://verify.example.com/jobs?embed=learncard-partner-connect?lc_host_override=http://learncard.app'
		);

		expect(readEmbedLaunchParams(url).hostOrigin).toBeNull();
	});

	it('rejects a malformed override value (falls back to null)', () => {
		const url = new URL(
			'https://verify.example.com/jobs?embed=learncard-partner-connect?lc_host_override=not-a-url'
		);

		expect(readEmbedLaunchParams(url).hostOrigin).toBeNull();
	});

	it('narrows an unknown embed value to null', () => {
		const url = new URL('https://verify.example.com/jobs?embed=something-else');

		expect(readEmbedLaunchParams(url).embed).toBeNull();
	});

	it('returns nulls for a query-less URL', () => {
		const url = new URL('https://verify.example.com/jobs');

		expect(readEmbedLaunchParams(url)).toEqual({ embed: null, hostOrigin: null });
	});
});
