import { describe, expect, it } from 'vitest';

import {
	DEFAULT_EXPIRY_DAYS,
	MAX_EXPIRY_DAYS,
	defaultArchiveAfter,
	extendedArchiveAfter,
	isMatchExpired,
	verifyMatchCapability
} from './match-capability.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date('2026-07-04T00:00:00.000Z');

describe('verifyMatchCapability', () => {
	it('accepts the exact token', () => {
		expect(verifyMatchCapability({ capabilityToken: 'abc123' }, 'abc123')).toBe(true);
	});

	it('rejects a wrong token', () => {
		expect(verifyMatchCapability({ capabilityToken: 'abc123' }, 'abc124')).toBe(false);
	});

	it('rejects a length mismatch', () => {
		expect(verifyMatchCapability({ capabilityToken: 'abc123' }, 'abc12')).toBe(false);
	});

	it('rejects an empty/absent presented token', () => {
		expect(verifyMatchCapability({ capabilityToken: 'abc123' }, '')).toBe(false);
		expect(verifyMatchCapability({ capabilityToken: 'abc123' }, null)).toBe(false);
		expect(verifyMatchCapability({ capabilityToken: 'abc123' }, undefined)).toBe(false);
	});

	it('rejects everything when the stored token is empty (legacy read-only match)', () => {
		expect(verifyMatchCapability({ capabilityToken: '' }, '')).toBe(false);
		expect(verifyMatchCapability({ capabilityToken: '' }, 'anything')).toBe(false);
	});
});

describe('archiveAfter helpers', () => {
	it('defaults to now + 30 days', () => {
		expect(defaultArchiveAfter(now).getTime()).toBe(now.getTime() + DEFAULT_EXPIRY_DAYS * DAY_MS);
	});

	it('extends to now + N days', () => {
		expect(extendedArchiveAfter(now, 60).getTime()).toBe(now.getTime() + 60 * DAY_MS);
	});

	it('clamps extension to <= 90 days and floors at 1', () => {
		expect(extendedArchiveAfter(now, 365).getTime()).toBe(now.getTime() + MAX_EXPIRY_DAYS * DAY_MS);
		expect(extendedArchiveAfter(now, 0).getTime()).toBe(now.getTime() + 1 * DAY_MS);
	});
});

describe('isMatchExpired', () => {
	it('is false before the archive date and true after', () => {
		const archiveAfter = new Date(now.getTime() + DAY_MS);
		expect(isMatchExpired({ archiveAfter }, now)).toBe(false);
		expect(isMatchExpired({ archiveAfter }, new Date(archiveAfter.getTime() + 1))).toBe(true);
		expect(isMatchExpired({ archiveAfter }, archiveAfter)).toBe(true); // exactly at boundary
	});
});
